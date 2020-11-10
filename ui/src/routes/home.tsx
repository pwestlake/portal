import { Button } from "@material-ui/core";
import React from "react";
import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

const Home: FunctionComponent = () => {
    // const [dotpercentRole, setDotpercentRole] = React.useState(false);
    // React.useEffect(() => {
    //     Auth.currentSession().then(session => {
    //         const details = session.getIdToken().decodePayload();
    //         const groups = details['cognito:groups'] as string[];
    //         if (groups !== undefined) {
    //             setDotpercentRole(groups.includes('dotpercent'));
    //         }
    //     });
    // }, []);

    return (
        <div>
            <img width="100%" alt="hill" src="./hill.jpeg" />
            <Button component={Link} to={'/private/covid19'}>Covid19</Button>
            <Button component={Link} to={'/private/equity-fund'}>Equity Fund</Button>
        </div>
    );
}

export default Home;