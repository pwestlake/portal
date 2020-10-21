import React from "react";
import { Grid } from "@material-ui/core";

interface DataTabProps {

}

interface DataTabState {
}

export class DataTab extends React.Component<DataTabProps, DataTabState> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <Grid container direction="column" spacing={3}>
                <Grid item xs={12}>
                    Data tab
                </Grid>
            </Grid>
        )
    }
}

export default DataTab;