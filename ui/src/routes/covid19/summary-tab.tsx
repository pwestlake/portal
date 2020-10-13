import React from "react";
import { Grid, Card, CardHeader, CardContent } from "@material-ui/core";
import { API, Auth } from "aws-amplify";
import { KeyValueModel } from "../../models/keyvalue";
import HbarChartComponent from "../../components/chart/hbar-chart/hbar-chart-component";

interface SummaryTabState {
    cases: KeyValueModel[];
    deaths: KeyValueModel[];
}
  
interface SummaryTabProps {
}

export class SummaryTab extends React.Component<SummaryTabProps, SummaryTabState> {

    constructor(props: any) {
      super(props);
      this.state = {
          cases: [] as KeyValueModel[],
          deaths: [] as KeyValueModel[]
      };
    }

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
    }
    
    render() {
        return (
            <Grid container direction="column" spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Total Cases">
                            
                        </CardHeader>
                        <CardContent className="card">
                            <HbarChartComponent data={this.state.cases}/>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Total Deaths">
                            
                        </CardHeader>
                        <CardContent className="card">
                            <HbarChartComponent data={this.state.deaths}/>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        )}
}
