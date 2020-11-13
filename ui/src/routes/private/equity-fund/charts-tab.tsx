import { Card, CardContent, CardHeader, Grid } from "@material-ui/core";
import React from "react";
import { EquityCatalogItemModel } from "../../../models/equitycatalogitem";
import EquityChart from "./equity-chart";

export interface ChartsTabProps {
    catalog: EquityCatalogItemModel[]
}


const ChartsTab = (props: ChartsTabProps) => {
    return (
        <Grid container>
            {props.catalog.map((i) => {
                return (
                    <Grid key={i.id} item xs={12} md={4} style={{padding: "12px 12px 0px 12px"}}>
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