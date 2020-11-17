import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme } from "@material-ui/core";
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

    const financial = (x) => Number.parseFloat(x).toFixed(2);

    return (
        <div style={{height: "100%" }}>
            <TableContainer style={{height: "100%" }} >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Symbol</TableCell>
                            {greaterThanSm && <TableCell>Open</TableCell>}
                            <TableCell>High</TableCell>
                            <TableCell>Low</TableCell>
                            <TableCell>Close</TableCell>
                            <TableCell>Change</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell scope="row">{row.symbol}</TableCell>
                                {greaterThanSm && <TableCell>{row.open}</TableCell>}
                                <TableCell>{row.high}</TableCell>
                                <TableCell>{row.low}</TableCell>
                                <TableCell>{row.close}</TableCell>
                                <TableCell>
                                    <span className={row.close_chg > 0 ? 'up' : row.close_chg < 0 ? 'down' : ''}>
                                        {financial(row.close_chg)}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default LatestTab