import React from "react";
import { Grid, Card, CardHeader, CardContent } from "@material-ui/core";
import { API, Auth } from "aws-amplify";
import { KeyValueModel } from "../../models/keyvalue";
import HBarChart from "../../components/chart/hbar-chart/hbar-chart";
import { ResizeObserver } from 'resize-observer';

interface SummaryTabState {
    cases: KeyValueModel[];
    deaths: KeyValueModel[];
    dimension: {
        height: number;
        width: number;
    };
}
  
interface SummaryTabProps {
}
  
export class SummaryTab extends React.Component<SummaryTabProps, SummaryTabState> {

    constructor(props: any) {
      super(props);
      this.state = {
          cases: [] as KeyValueModel[],
          deaths: [] as KeyValueModel[],
          dimension: {
              height: 0,
              width: 0
          }
      };
    }

    ref: HTMLDivElement | null = null; 
    resizeObserver: ResizeObserver | null = null;

    async componentDidMount() {
        let sessionObject = await Auth.currentSession();
        let casesPath = "summary/all-covid-cases";
        let deathsPath = "summary/all-covid-deaths";
        let idToken = sessionObject.getIdToken().getJwtToken();
        let init = {
            response: true,
            headers: { Authorization: idToken }
        }
        API.get('covid19', casesPath, init)
            .then(response => {
                this.setState({cases: response.data as KeyValueModel[]});
            })
            .catch(error => {
                console.log(error.response);
            });

        API.get('covid19', deathsPath, init)
            .then(response => {
                this.setState({deaths: response.data as KeyValueModel[]});
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
        return (
            <Grid container direction="column" spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Total Cases">
                            
                        </CardHeader>
                        <CardContent className="card">
                            <div style={{height: "100%", width: "100%"}} ref={el => (this.ref = el)}>
                                <HBarChart data={this.state.cases} width={this.state.dimension.width} height={this.state.dimension.height}/>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Total Deaths">
                            
                        </CardHeader>
                        <CardContent className="card">
                            <HBarChart data={this.state.deaths} width={this.state.dimension.width} height={this.state.dimension.height}/>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        )}
}
