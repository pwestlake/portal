import { Button } from "@material-ui/core";
import React from "react";
import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

const Home: FunctionComponent = () => {
    return (
        <div>
            <img width="100%" alt="hill" src="./hill.jpeg" />
            <Button component={Link} to={'/private/covid19'}>Covid19</Button>
        </div>
    );
}

export default Home;