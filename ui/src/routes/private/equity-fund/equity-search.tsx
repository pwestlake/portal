import React from "react";
import { Box, Button, Grid, TextField, Typography } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { EquityCatalogItemModel } from "../../../models/equitycatalogitem";

export interface EquitySearchProps {
    equities: EquityCatalogItemModel[];
    onClose?(): void;
    onChange(value): void;
}

const EquitySearch = (props: EquitySearchProps) => {
    
    const handleChange = (e: React.ChangeEvent, v: any) => {
        props.onChange((v as EquityCatalogItemModel).id);
    }

    return (
        <Box p={2}>
            <Grid container direction="column" justify="space-between" alignItems="center">
                <Grid item xs={12}> 
                    <div style={{paddingTop: "32px"}}>
                        <Autocomplete
                            id="equity-selector"
                            options={props.equities}
                            onChange={handleChange}
                            getOptionLabel={(option) => option.symbol}
                            renderOption={(option) => (
                                <React.Fragment>
                                    <Grid container wrap="nowrap" direction="column">
                                        <Grid item>
                                            <Typography variant="body1">{option.symbol}</Typography>
                                        </Grid>
                                        <Grid item xs zeroMinWidth>
                                            <Typography noWrap variant="subtitle2">{option.lseissuername}</Typography>
                                        </Grid>
                                    </Grid>
                                </React.Fragment>
                            )}
                            style={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} placeholder="Ticker" />}
                            />
                    </div>
                </Grid>
                <Grid container direction="row" justify="flex-end" style={{paddingTop: "96px"}}>
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={props.onClose}>Close</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
        
    );
}

export default EquitySearch;