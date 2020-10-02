import React from "react";
import { Auth, API } from "aws-amplify";

interface HbarChartComponentState {
    msg: string;
    done: boolean;
}

interface HbarChartComponentProps {
}

export class HbarChartComponent extends React.Component<HbarChartComponentProps, HbarChartComponentState> {
    constructor(props: any) {
        super(props);
        this.state = {
            msg: "loading",
            done: false
        };
    }

    async componentDidMount() {
        let sessionObject = await Auth.currentSession();
        let path = "summary";
        let idToken = sessionObject.getIdToken().getJwtToken();
        let init = {
            response: true,
            headers: { Authorization: idToken }
        }
        API.get('covid19', path, init)
            .then(response => {
                this.setState({msg: response.data.msg});
            })
            .catch(error => {
                console.log(error.response);
            });
        
        
    }
    render() {
        return <p>{this.state.msg}</p>
    }
}