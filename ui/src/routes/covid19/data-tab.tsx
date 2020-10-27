import React from "react";
import { Drawer, Grid, Icon, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { Covid19TableItemModel } from "../../models/coviddataitem";
import { API, Auth } from "aws-amplify";
import { ResizeObserver } from "resize-observer";
import CountrySearch from "./country-search";

interface DataTabProps {
    regions: string[];
}

interface DataTabState {
    dimension: {
        height: number;
        width: number;
    };
    data: Covid19TableItemModel[];
    region: string;
    searchPanelOpen: boolean;
}

export class DataTab extends React.Component<DataTabProps, DataTabState> {
    constructor(props: any) {
        super(props);
        this.state = {
            dimension: {
                height: 0,
                width: 0
            },
            data: [] as Covid19TableItemModel[],
            region: '',
            searchPanelOpen: false
        }
    }

    refTable: HTMLDivElement | null = null; 
    resizeObserver: ResizeObserver | null = null;
    lastRowElement: Element | null = null; 
    

    async componentDidMount() {
        this.fetchData(20, '', '', this.state.region);

        this.resizeObserver = new ResizeObserver((entries) => {
            this.setState({
                dimension: {
                    width: this.refTable.getBoundingClientRect().width,
                    height: this.refTable.getBoundingClientRect().height,
                }
            });
        });

        this.resizeObserver.observe(this.refTable);
    }

    componentWillUnmount() {
        this.resizeObserver?.disconnect();
        this.observer.disconnect();
    }

    async fetchData(count: number, key: string, sortKey: string, region: string) {
        let sessionObject = await Auth.currentSession();
        let path = "covid19data/all";
        let idToken = sessionObject.getIdToken().getJwtToken();
        let init = {
            response: true,
            headers: { Authorization: idToken },
            queryStringParameters: {
                count: count,
                key: key,
                sortKey: sortKey,
                region: region
            }
        };
        API.get('covid19', path, init)
            .then(response => {
                this.setState(state => {
                    let array = state.data.concat(response.data as Covid19TableItemModel[]);
                    return {data: array}
                });
            })
            .catch(error => {
                console.log(error.response);
            });
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
        this.setState({
            region: value,
            data: [] as Covid19TableItemModel[]
        })
        this.fetchData(20, '', '', value);
    }

    handleCallback = (e) => {
        if (typeof(e) !== 'undefined' &&  e instanceof Element) {
            this.lastRowElement = e;
            this.observer.observe(e);
        }
    }

    callback = entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target === this.lastRowElement) {
            const elements = this.state.data.length;
            this.fetchData(20, 
                this.state.data[elements - 1].countryexp, 
                this.state.data[elements - 1].daterep, this.state.region);
          }
        });
      };
    options = { threshold: 0.5 };
    observer = new IntersectionObserver(this.callback, this.options);
    
    render() {
        return (
            <div style={{height: "100%" }} ref={el => (this.refTable = el)}>
                <TableContainer style={{height: this.state.dimension.height}} >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Region</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Cases</TableCell>
                                <TableCell>Deaths</TableCell>
                                <TableCell>Population</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.data.map((row) => (
                                <TableRow key={row.daterep} ref={el => this.handleCallback(el)}>
                                    <TableCell scope="row">{row.countryexp}</TableCell>
                                    <TableCell>{row.daterep}</TableCell>
                                    <TableCell>{row.newConfcases}</TableCell>
                                    <TableCell>{row.newdeaths}</TableCell>
                                    <TableCell>{row.popdata2019}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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
            </div>
        )
    }
}

export default DataTab;