import { Card, Grid, Paper, useMediaQuery, useTheme} from "@material-ui/core";
import React from "react";
import { useParams } from "react-router-dom";
import EODEditForm from "./eod-edit-form";

interface EODEditViewProps {
}

interface EODEditViewParams {
    id: string
}


const EODEditView = (props: EODEditViewProps) => {
    let params: EODEditViewParams = useParams<EODEditViewParams>();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('xs'));

    return (
        <Grid container direction="column">
            <Grid item>
                <Paper square={true} style={{height: "calc(100vh - 64px)" , overflow: "scroll", padding: "24px"}}>
                    {!mobile && <Card style={{width: "425px", padding: "24px"}}>
                            <EODEditForm id={params.id}/>
                        </Card>}
                    {mobile && <EODEditForm id={params.id}/>}
                </Paper>
            </Grid>
        </Grid>   
    )
}

export default EODEditView;