import React from "react";
import { DateValueModel } from "../../../models/datevalue";
import { ResizeObserver } from "resize-observer";
import { Auth, API } from "aws-amplify";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import DateValueChart from "../../../components/chart/date-value/date-value";
import { IconButton, Icon, Drawer, Box } from "@material-ui/core";
import CountrySearch from "./country-search";

interface CountryTabProps {
    regions: string[];
}

interface CountryTabState {
    cases: DateValueModel[];
    deaths: DateValueModel[];
    dimension: {
        height: number;
        width: number;
    };
    region: string;
    display: CardType;
    searchPanelOpen: boolean;
}

enum CardType {
    All,
    Cases,
    Deaths
}

export class CountryTab extends React.Component<CountryTabProps, CountryTabState> {
    constructor(props: any) {
        super(props);
        this.state = {
            cases: [] as DateValueModel[],
            deaths: [] as DateValueModel[],
            dimension: {
                height: 0,
                width: 0
            },
            region: 'United_Kingdom',
            display: CardType.All,
            searchPanelOpen: false
        };
    }

    refCases: HTMLDivElement | null = null; 
    refDeaths: HTMLDivElement | null = null; 
    resizeObserver: ResizeObserver | null = null;
    
    pinCard = (type: CardType) => {
        this.setState({
            display: type,
        });
    }

    async componentDidMount() {
        await this.fetchData();
        
        this.resizeObserver = new ResizeObserver((entries) => {
            this.setState({
                dimension: {
                    width: this.refCases.getBoundingClientRect().width - 24 - 32,
                    height: this.refCases.getBoundingClientRect().height - 24 - 32 - 72,
                }
            });
        });
        
        this.resizeObserver.observe(this.refCases);
    }
    
    private async fetchData() {
        let sessionObject = await Auth.currentSession();
        let casesPath = "covid19data/cases";
        let deathsPath = "covid19data/deaths";
        let idToken = sessionObject.getIdToken().getJwtToken();
        let init = {
            response: true,
            headers: { Authorization: idToken }
        };
        API.get('covid19', casesPath + "/" + this.state.region, init)
            .then(response => {
                this.setState({ cases: response.data as DateValueModel[] });
            })
            .catch(error => {
                console.log(error.response);
            });
        
        API.get('covid19', deathsPath + "/" + this.state.region, init)
            .then(response => {
                this.setState({ deaths: response.data as DateValueModel[] });
            })
            .catch(error => {
                console.log(error.response);
            });
    }

    componentWillUnmount() {
        this.resizeObserver?.disconnect();
    }
    
    openSearchPanel = () => {
        this.setState({
            searchPanelOpen: true
        });
    }

    closeSearchPanel = () => {
        this.setState({
            searchPanelOpen: false
        });
    }

    onCountryChanged = (value) => {
        this.closeSearchPanel();
        this.fetchData();
        this.setState({
            region: value
        })
    }
    
    render() {
        const display: CardType = this.state.display;
        const pinCases =  (
            <IconButton aria-label="pin" onClick={() => this.pinCard(CardType.Cases)}>
                <Icon>push_pin</Icon>
            </IconButton>
            );

        const pinDeaths =  (
            <IconButton aria-label="pin" onClick={() => this.pinCard(CardType.Deaths)}>
                <Icon>push_pin</Icon>
            </IconButton>
            );

        const unPin =  (
            <IconButton aria-label="un pin" onClick={() => this.pinCard(CardType.All)}>
                <Icon>view_agenda</Icon>
            </IconButton>
            );
        return (
            <Box p={2}>
                <Grid container direction="column" spacing={3} ref={el => (this.refCases = el)}>
                    <Grid container 
                        alignContent="center"
                        justify="flex-end"
                        direction="row" 
                        spacing={2} 
                        className="action-buttons">
                        <Grid item>
                            <IconButton aria-label="settings button" 
                                edge="end"  
                                style={{pointerEvents: "auto", color: "white"}}
                                onClick={() => this.openSearchPanel()}>
                                <Icon>search</Icon>
                            </IconButton>
                        </Grid>    
                    </Grid>
                    <Drawer anchor='right' 
                        open={this.state.searchPanelOpen} 
                        variant="temporary">
                        <CountrySearch regions={this.props.regions} 
                            onChange={this.onCountryChanged} onClose={this.closeSearchPanel}/>
                    </Drawer>
                    {(display === CardType.All || display === CardType.Cases) &&
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Total Cases"
                                action={(display === CardType.All) ? pinCases : unPin}> 
                            </CardHeader>
                            <CardContent style={display === CardType.All ? {height: "300px"} : {height: "calc(100vh - 256px)"}}>
                                <div style={{height: "100%", width: "100%"}}>
                                    <DateValueChart id="cases" data={this.state.cases} 
                                        width={this.state.dimension.width} 
                                        height={display === CardType.All ? 300 : this.state.dimension.height}/>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>}
                
                    {(display === CardType.All || display === CardType.Deaths) &&
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Total Deaths"
                                action={(display === CardType.All) ? pinDeaths : unPin}> 
                                
                            </CardHeader>
                            <CardContent style={display === CardType.All ? {height: "300px"} : {height: "calc(100vh - 256px)"}}>
                                <div style={{height: "100%", width: "100%"}}>
                                    <DateValueChart id="deaths" data={this.state.deaths} 
                                        width={this.state.dimension.width} 
                                        height={display === CardType.All ? 300 : this.state.dimension.height}/>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>}
                </Grid>
            </Box>
        )}
}
