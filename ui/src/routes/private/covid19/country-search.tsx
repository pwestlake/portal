import React from "react";
import { Box, Button, Grid, TextField } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';

export interface CountrySearchProps {
    regions: string[];
    onClose?(): void;
    onChange(value): void;
}

const CountrySearch = (props: CountrySearchProps) => {
    
    const handleChange = (e, v) => {
        props.onChange(v);
    }

    return (
        <Box p={2}>
            <Grid container direction="column" justify="space-between" alignItems="center">
                <Grid item xs={12}> 
                    <div style={{paddingTop: "32px"}}>
                        <Autocomplete
                            id="country-selector"
                            options={props.regions}
                            onChange={handleChange}
                            getOptionLabel={(option) => option}
                            style={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} placeholder="Region" />}
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

export default CountrySearch;