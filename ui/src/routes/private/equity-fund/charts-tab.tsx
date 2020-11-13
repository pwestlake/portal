import { Card, CardContent, CardHeader, Grid } from "@material-ui/core";
import React from "react";
import { EquityCatalogItemModel } from "../../../models/equitycatalogitem";
import EquityChart from "./equity-chart";

export interface ChartsTabProps {
    catalog: EquityCatalogItemModel[]
}


const ChartsTab = (props: ChartsTabProps) => {
    return (
        <Grid container spacing={3} style={{padding: "16px"}}>
            {props.catalog.map((i) => {
                return (
                    <Grid key={i.id} item xs={12} md={4} >
                        <Card>
                            <CardHeader title={i.symbol}>
                            </CardHeader>
                            <CardContent style={{height: "300px"}}>
                                <EquityChart id={i.id}></EquityChart>
                            </CardContent>
                        </Card>
                    </Grid>)
            })}
        </Grid>
    );
}

export default ChartsTab