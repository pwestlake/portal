import React from "react";
import { FunctionComponent } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import Home from "./routes/home";
import PrivateApp from "./PrivateApp";

const PublicApp: FunctionComponent = () => {
    return (
        <HashRouter>
            <Switch>
                <Route exact path="/" render={() => <Home/>}/>
                <Route path="/private" render={() => <PrivateApp />}/>
            </Switch>
        </HashRouter>
    );
}

export default PublicApp;