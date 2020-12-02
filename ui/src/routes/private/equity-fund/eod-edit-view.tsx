import { Grid, Paper} from "@material-ui/core";
import React from "react";

interface EODEditViewProps {
}

interface EODEditViewParams {
    id: string
}


const EODEditView = (props: EODEditViewProps) => {

    const handleSubmit = () => {
        
    }
    return (
        <Grid container direction="column">
            <Grid item>
                <Paper square={true} style={{height: "calc(100vh - 56px)" , overflow: "scroll", padding: "24px"}}>
                    <button onClick={handleSubmit}>button</button>
                </Paper>
            </Grid>
        </Grid>   
    )
}

export default EODEditView;