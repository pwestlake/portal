import React from "react";
import { Grid, Switch, Button, FormControl, Select, MenuItem } from "@material-ui/core";

export interface SettingsProps {
    onClose(): void;
    perCapita: boolean;
    multiplier: number;
    onPerCapitaChange(value): void;
    onMultiplierChange(value): void;
}

const Settings = (props: SettingsProps) => {
    const perCapita = props.perCapita;

    const handlePerCapitaChange = (e) => {
        props.onPerCapitaChange(e.target.checked);
    }

    const handleMultiplierChange = (e) => {
        props.onMultiplierChange(e.target.value);
    }

    return (
        <div style={{margin: "16px", width: "250px"}}>
            <h3>Settings</h3>
            <Grid container direction="row" justify="space-between" alignItems="center">
                <Grid item xs={6}> 
                    <span>Show&nbsp;as&nbsp;Per&minus;Capita:</span>
                </Grid>
                <Grid item xs={6}>
                    <Grid container direction="row" justify="flex-end">
                        <Grid item>
                            <Switch checked={perCapita} onChange={handlePerCapitaChange}/>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={6}> 
                    <span>Multiplier:</span>
                </Grid>
                <Grid item xs={6}>
                    <Grid container direction="row" justify="flex-end">
                        <Grid item>
                            <FormControl>
                                <Select
                                    id="multiplier-select"
                                    disabled={!perCapita}
                                    value={props.multiplier}
                                    onChange={handleMultiplierChange}>
                                    <MenuItem value={100000}>100,000</MenuItem>
                                    <MenuItem value={10000000}>1000,0000</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Grid container direction="row" justify="flex-end" style={{paddingTop: "48px"}}>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={props.onClose}>Close</Button>
                </Grid>
            </Grid>
        </div>
    )
}

export default Settings;