import React from "react";
import { DateValueModel } from "../../models/datevalue";
import { ResizeObserver } from "resize-observer";
import { Auth, API } from "aws-amplify";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import DateValueChart from "../../components/chart/date-value/date-value";
import { IconButton, Icon } from "@material-ui/core";
import MoreIcon from '@material-ui/icons/PinDrop';

interface CountryTabProps {

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
        };
    }

    ref: HTMLDivElement | null = null; 
    resizeObserver: ResizeObserver | null = null;
    
    pinCard = (type: CardType) => {
        this.setState({
            display: type,
        });
    }

    async componentDidMount() {
        let sessionObject = await Auth.currentSession();
        let casesPath = "covid19data/cases";
        let deathsPath = "covid19data/deaths";
        let idToken = sessionObject.getIdToken().getJwtToken();
        let init = {
            response: true,
            headers: { Authorization: idToken }
        }
        API.get('covid19', casesPath + "/" + this.state.region, init)
            .then(response => {
                this.setState({cases: response.data as DateValueModel[]});
            })
            .catch(error => {
                console.log(error.response);
            });
        
        this.resizeObserver = new ResizeObserver((entries) => {
            this.setState({
                dimension: {
                    width: this.ref!.getBoundingClientRect().width,
                    height: this.ref!.getBoundingClientRect().height,
                }
            });
        });
        
        this.resizeObserver.observe(this.ref!);
    }
    
    componentWillUnmount() {
        this.resizeObserver?.disconnect();
    }
    
    render() {
        const display: CardType = this.state.display;
        
        return (
            <Grid container direction="column" spacing={3}>
                {(display === CardType.All || display === CardType.Cases) &&
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Total Cases"
                        action={
                            <IconButton aria-label="pin" onClick={() => this.pinCard(CardType.Cases)}>
                              <Icon>push_pin</Icon>
                            </IconButton>
                          }> 
                        </CardHeader>
                        <CardContent style={display === CardType.All ? {height: "300px"} : {height: "calc(100vh - 224px)"}}>
                            <div style={{height: "100%", width: "100%"}} ref={el => (this.ref = el)}>
                                <DateValueChart data={this.state.cases} 
                                    width={this.state.dimension.width} 
                                    height={this.state.dimension.height}/>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>}
            
                {(display === CardType.All || display === CardType.Deaths) &&
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Total Deaths">
                            
                        </CardHeader>
                        <CardContent style={{height: "300px"}}>
                            <div style={{height: "100%", width: "100%"}} ref={el => (this.ref = el)}>
                                <DateValueChart data={this.state.cases} width={this.state.dimension.width} height={this.state.dimension.height}/>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>}
            </Grid>
        );
    }
}
