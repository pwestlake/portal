import { Button, Grid, TextField, useMediaQuery, useTheme } from "@material-ui/core";
import React from "react";
import { useHistory } from "react-router-dom";
import { NotificationMessage } from "./latest-tab";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns';
import { EndOfDayItem } from "../../../models/eoditem";
import { API, Auth } from "aws-amplify";
import { convertToyyyyMMdd } from "../../../utils/date";

interface EODEditFormProps {
    id: string;
}

const EODEditForm = (props: EODEditFormProps) => {
    const history = useHistory<NotificationMessage>();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('xs'));
    const [eodItem, setEodItem] = React.useState<EndOfDayItem>({} as EndOfDayItem);

    const yesterday = (): Date => {
        let date = new Date();
        date.setDate(date.getDate() - 1);

        return date;
    }

    const [date, setDate] = React.useState<Date>(yesterday());

    React.useEffect(() => {
        async function sourceAndSetData() {
            let sessionObject = await Auth.currentSession().catch(e => undefined);
            if (sessionObject !== undefined) {
                let idToken = sessionObject.getIdToken().getJwtToken();
                let init = {
                    response: false,
                    headers: { Authorization: idToken }
                }
    
                let result = await API.get('covid19', `/eod/price/${props.id}/${convertToyyyyMMdd(date)}`, init)
                .catch(e =>  { 
                    return {} as EndOfDayItem});
            
                setEodItem(result as EndOfDayItem);
            }
        }
        
        if (date !== undefined) {
            sourceAndSetData();
        }
    }, [props.id, date]);

    const handleCancel = () => {
        history.goBack();
    }

    const handleSubmit = () => {
        history.replace('/private/equity-fund', {severity: "success", message: "All done"});
    }

    const dateValidator = (date: any): boolean => {
        if (date === undefined || date === null) {
            return false;
        }

        if (typeof(date) === "string") {
            date = new Date(date);
        }
        return date.getTime() < new Date().getTime()
    }

    const priceValidator = (price: number): boolean => {
        if (price === undefined || price === null) {
            return false;
        }

        return price > 0;
    }

    const validators: Map<string, (value: any) => boolean> = new Map(
        [
            ["date", dateValidator],
            ["open", priceValidator],
            ["high", priceValidator],
            ["low", priceValidator],
            ["close", priceValidator]
        ]
    );

    const handleDateChange = (date: Date) => {
        setDate(date);
    }

    const handleValueChange = (e: any) => {
        const inputElement = e.target as HTMLInputElement;
        setEodItem({...eodItem, [inputElement.name]: e.target.value});
    }

    const isFieldValid = (field: string): boolean => {
        const validator = validators.get(field);
        if (validator === undefined) {
            return true;
        }

        return validator(eodItem[field]);
    }
    
    const isFormValid = (): boolean => {
        const fields: string[] = Object.keys(eodItem);

        if (fields.length === 0) {
            return false;
        }

        let valid = fields.length > 0;
        for (let field of fields) {
            console.log(field + " " + isFieldValid(field));
            valid = (valid && isFieldValid(field));
        }

        return valid;
    }

    

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <form onSubmit={handleSubmit} autoComplete="off">
                <Grid container direction="column" spacing={2}>
                    <Grid item container direction="row" justify="space-between" spacing={2} style={{height: "94px"}}>
                        <Grid item>
                            <p>Date of price</p>
                        </Grid>
                        <Grid item>
                            <KeyboardDatePicker
                                autoOk={true}
                                style={{width: "167px"}}
                                disableToolbar={mobile ? false : true}
                                variant={mobile ? "dialog" : "inline"}
                                format="dd/MM/yyyy"
                                margin="normal"
                                id="date"
                                value={eodItem.date}
                                error={!isFieldValid("date")}
                                helperText={!isFieldValid("date") ? "No price for this date" : ""}
                                name="date"
                                onChange={handleDateChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }} />
                        </Grid>
                    </Grid>

                    {/*Symbol*/}
                    <Grid item container direction="row" justify="space-between" spacing={2} style={{height: "94px"}}>
                        <Grid item>
                            <p>Symbol</p>
                        </Grid>
                        <Grid item>
                        <TextField id="symbol" 
                            disabled={true}
                            value={eodItem.symbol} />
                        </Grid>
                    </Grid>

                    {/*Open price*/}
                    <Grid item container direction="row" justify="space-between" spacing={2} style={{height: "94px"}}>
                        <Grid item>
                            <p>Open price</p>
                        </Grid>
                        <Grid item>
                        <TextField id="open"
                            error={!isFieldValid("open")}
                            helperText={isFieldValid("open") ? "" : "Invalid price"}
                            name="open"
                            inputProps={{style: {textAlign: "right"}}}
                            onChange={handleValueChange}
                            onFocus={(e) => {e.target.select()}}
                            value={eodItem.open} />
                        </Grid>
                    </Grid>

                    {/*High price*/}
                    <Grid item container direction="row" justify="space-between" spacing={2} style={{height: "94px"}}>
                        <Grid item>
                            <p>High price</p>
                        </Grid>
                        <Grid item>
                        <TextField id="high-price" 
                            error={!isFieldValid("high")}
                            helperText={isFieldValid("high") ? "" : "Invalid price"}
                            inputProps={{style: {textAlign: "right"}}}
                            name="high"
                            onChange={handleValueChange}
                            onFocus={(e) => {e.target.select()}}
                            value={eodItem.high} />
                        </Grid>
                    </Grid>

                    {/*Low price*/}
                    <Grid item container direction="row" justify="space-between" spacing={2} style={{height: "94px"}}>
                        <Grid item>
                            <p>Low price</p>
                        </Grid>
                        <Grid item>
                        <TextField id="Low-price" 
                            error={!isFieldValid("low")}
                            helperText={isFieldValid("low") ? "" : "Invalid price"}
                            inputProps={{style: {textAlign: "right"}}}
                            name="low"
                            onChange={handleValueChange}
                            onFocus={(e) => {e.target.select()}}
                            value={eodItem.low} />
                        </Grid>
                    </Grid>

                    {/*Close price*/}
                    <Grid item container direction="row" justify="space-between" spacing={2} style={{height: "94px"}}>
                        <Grid item>
                            <p>Close price</p>
                        </Grid>
                        <Grid item>
                        <TextField id="eod-price" 
                            error={!isFieldValid("close")}
                            helperText={isFieldValid("close") ? "" : "Invalid price"}
                            inputProps={{style: {textAlign: "right"}}}
                            name="close"
                            onChange={handleValueChange}
                            onFocus={(e) => {e.target.select()}}
                            value={eodItem.close} />
                        </Grid>
                    </Grid>

                    

                    <Grid item container direction="row" justify="flex-end" spacing={2} style={{paddingTop: "96px"}}>
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={() => handleCancel()}>
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button disabled={!isFormValid()} type="submit" variant="contained" color="primary">
                                Submit
                            </Button>
                        </Grid>
                    </Grid>

                </Grid>
        </form>
       </MuiPickersUtilsProvider>
    )
}

export default EODEditForm;