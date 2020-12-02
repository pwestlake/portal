import { AppBar, Grid, Icon, IconButton, makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { API, Auth } from "aws-amplify";
import React from "react";
import { useHistory } from "react-router-dom";
import { EndOfDayItem } from "../../../models/eoditem";
import "./latest-tab.css";

export interface LatestTabProps {
}

interface TableItem extends EndOfDayItem {
    selected: boolean
}

const useStyles = makeStyles({
    tableRowSelected: (theme: Theme) => ({
        backgroundColor: theme.palette.secondary.main
    }),
    tableCellSelected: (theme: Theme) => ({
        color: theme.palette.secondary.contrastText
    }),
    up: {
        color: "greenyellow"
    },
    upSelected: {
        color: "darkgreen"
    }
});

const LatestTab = (props: LatestTabProps) => {
    const [data, setData] = React.useState<EndOfDayItem[]>([]);
    const theme = useTheme();
    const classes = useStyles(theme);
    const greaterThanSm = useMediaQuery(theme.breakpoints.up('sm'));
    const [selectedItem, setSelectedItem] = React.useState<TableItem>();
    const [editRole, setEditRole] = React.useState(false);
    const history = useHistory();
    
    React.useEffect(() => {
        Auth.currentSession().then(session => {
            const details = session.getIdToken().decodePayload();
            const groups = details['cognito:groups'] as string[];
            if (groups !== undefined) {
                setEditRole(groups.includes('dotpercent-edit'));
            }
        });
    }, []);

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

    const onItemSelected = (value: TableItem) => {
        if (selectedItem !== undefined) {
            selectedItem.selected = false;
        }

        value.selected = true;
        setSelectedItem(value);
    }

    const onEditItem = () => {
        history.push('/private/equity-fund/edit-price/' + selectedItem.id);
    }

    return (
        <div style={{height: "100%" }}>
            <Grid container direction="column">
                <Grid container
                    alignContent="center"
                    justify="flex-end"
                    direction="row"
                    spacing={2}
                    className="action-buttons">
                    <Grid item>
                        {editRole && <IconButton aria-label="edit button"
                            disabled={selectedItem === undefined}
                            edge="end"
                            style={{ pointerEvents: "auto" }}
                            onClick={() => onEditItem()}>
                            <Icon>edit</Icon>
                        </IconButton>}
                    </Grid>
                </Grid>
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
                                {(data as TableItem[]).map((row) => (
                                    <TableRow className={row.selected ? classes.tableRowSelected : ''} key={row.id} onClick={() => onItemSelected(row)}>
                                        <TableCell className={row.selected ? classes.tableCellSelected : ''} scope="row">{row.symbol}</TableCell>
                                        {greaterThanSm && <TableCell className={row.selected ? classes.tableCellSelected : ''} align={"right"}>{row.open}</TableCell>}
                                        {greaterThanSm && <TableCell className={row.selected ? classes.tableCellSelected : ''} align={"right"}>{row.high}</TableCell>}
                                        {greaterThanSm && <TableCell className={row.selected ? classes.tableCellSelected : ''} align={"right"}>{row.low}</TableCell>}
                                        {!greaterThanSm && <TableCell className={row.selected ? classes.tableCellSelected : ''}>{row.high}/{row.low}</TableCell>}
                                        <TableCell className={row.selected ? classes.tableCellSelected : ''} align={"right"}>{financial(row.close)}</TableCell>
                                        <TableCell className={row.selected ? classes.tableCellSelected : ''} align={"right"}>
                                            <span className={row.close_chg > 0 ? (row.selected ? classes.upSelected : classes.up) : row.close_chg < 0 ? 'down' : ''}>
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