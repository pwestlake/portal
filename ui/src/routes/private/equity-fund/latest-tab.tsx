import { AppBar, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { API, Auth } from "aws-amplify";
import React from "react";
import { EndOfDayItem } from "../../../models/eoditem";
import "./latest-tab.css";

export interface LatestTabProps {
}

const LatestTab = (props: LatestTabProps) => {
    const [data, setData] = React.useState<EndOfDayItem[]>([]);
    const theme = useTheme();
    const greaterThanSm = useMediaQuery(theme.breakpoints.up('sm'));
  
    React.useEffect(() => {
        async function sourceAndSetData() {
            let sessionObject = await Auth.currentSession().catch(e => undefined);
            if (sessionObject !== undefined) {
                let idToken = sessionObject.getIdToken().getJwtToken();
                let init = {
                    response: false,
                    headers: { Authorization: idToken }
                }
    
                let result = await API.get('covid19', `/eod/latest-eod/`, init)
                .catch(e =>  { return {value: []}});
            
                setData(result as EndOfDayItem[]);
            }
        }
        
        sourceAndSetData();
    }, []);

    const financial = (x: number) => x.toFixed(2);

    const getTitle = (): string => {
        if (data.length === 0) {
            return "";
        }

        return new Date(data[0].date).toDateString();
    }

    return (
        <div style={{height: "100%" }}>
            <Grid container direction="column">
                <Grid item>
                    <AppBar position="static">
                        <Typography variant="h6" className="title">{getTitle()}</Typography>
                    </AppBar>
                </Grid>
                <Grid item>
                    <TableContainer style={{height: "calc(100vh - 159px)" }} >
                        <Table stickyHeader={true}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align={"center"}>Symbol</TableCell>
                                    {greaterThanSm && <TableCell align={"center"}>Open</TableCell>}
                                    {greaterThanSm && <TableCell align={"center"}>High</TableCell>}
                                    {greaterThanSm && <TableCell align={"center"}>Low</TableCell>}
                                    {!greaterThanSm && <TableCell align={"center"}>High/Low</TableCell>}
                                    <TableCell align={"center"}>Close</TableCell>
                                    <TableCell align={"center"}>Chg</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell scope="row">{row.symbol}</TableCell>
                                        {greaterThanSm && <TableCell align={"right"}>{row.open}</TableCell>}
                                        {greaterThanSm && <TableCell align={"right"}>{row.high}</TableCell>}
                                        {greaterThanSm && <TableCell align={"right"}>{row.low}</TableCell>}
                                        {!greaterThanSm && <TableCell>{row.high}/{row.low}</TableCell>}
                                        <TableCell align={"right"}>{financial(row.close)}</TableCell>
                                        <TableCell align={"right"}>
                                            <span className={row.close_chg > 0 ? 'up' : row.close_chg < 0 ? 'down' : ''}>
                                                {financial(row.close_chg)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </div>
    );
}

export default LatestTab