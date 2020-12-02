import React from "react";
import { FunctionComponent } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./routes/home";
import PrivateApp from "./PrivateApp";

const PublicApp: FunctionComponent = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" render={() => <Home/>}/>
                <Route path="/private" render={() => <PrivateApp />}/>
            </Switch>
        </BrowserRouter>
    );
}

export default PublicApp;