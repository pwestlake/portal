import { Card, CardContent, CardHeader, Grid, Icon, IconButton } from "@material-ui/core";
import React from "react";
import { EquityCatalogItemModel } from "../../../models/equitycatalogitem";
import EquityChart from "./equity-chart";

export interface ChartsTabProps {
    catalog: EquityCatalogItemModel[]
}


const ChartsTab = (props: ChartsTabProps) => {
    const [display, setDisplayIndex] = React.useState<string>(undefined);

    const pinCard = (id: string) => {
        setDisplayIndex(id);
    }

    const pin = (id: string) => {return (
        <IconButton aria-label="pin" onClick={() => pinCard(id)}>
            <Icon>push_pin</Icon>
        </IconButton>
        )};

    const unPin =  (
        <IconButton aria-label="un pin" onClick={() => pinCard(undefined)}>
            <Icon>view_agenda</Icon>
        </IconButton>
        );

    return (
        <Grid container style={display === undefined ? {} : {height: "100%"}}>
            {props.catalog.map((i) => {
                return (
                    (display === undefined || display === i.id) &&
                    <Grid key={i.id} item xs={12} md={4} style={{padding: "12px 12px 0px 12px", height: "100%"}}>
                        <Card style={{height: "100%"}}>
                            <CardHeader title={i.symbol}
                                action={(display === undefined) ? pin(i.id) : unPin}>
                            </CardHeader>
                            <CardContent style={display === undefined ? {height: "300px"} : {height: "calc(100vh - 216px)"}}>
                                <EquityChart id={i.id}></EquityChart>
                            </CardContent>
                        </Card>
                    </Grid>)
            })}
        </Grid>
    );
}

export default ChartsTab