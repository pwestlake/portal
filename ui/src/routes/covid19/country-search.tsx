import React, { useEffect } from "react";
import { TextField } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';

export interface CountrySearchProps {
    regions: string[];
    onClose?(): void;
    onChange(value): void;
}

const CountrySearch = (props: CountrySearchProps) => {
    useEffect(() => {
        console.log("Load");
    }, []);
    
    const handleChange = (e, v) => {
        props.onChange(v);
    }

    return (
        <div style={{paddingTop: "32px", paddingLeft: "16px", paddingRight: "16px"}}>
            <Autocomplete
                id="country-selector"
                options={props.regions}
                onChange={handleChange}
                getOptionLabel={(option) => option}
                style={{ width: 300 }}
                renderInput={(params) => <TextField {...params} placeholder="Region" />}
                />
        </div>
    );
}

export default CountrySearch;