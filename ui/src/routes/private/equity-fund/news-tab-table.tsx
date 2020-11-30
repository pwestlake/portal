import { Drawer, Grid, Icon, IconButton, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, useTheme } from "@material-ui/core";
import React from "react"
import { NewsItem } from "../../../models/newsitem";
import EquitySearch from "./equity-search";
import { NewsProps } from "./news-tab"
import NewsView from "./news-view";
import './news-tab-table.css'

interface TableItem extends NewsItem {
    selected: boolean
}

const useStyles = makeStyles({
    tableRowSelected: (theme: Theme) => ({
        backgroundColor: theme.palette.secondary.main
    }),
    tableCellSelected: (theme: Theme) => ({
        color: theme.palette.secondary.contrastText
    })
});

const NewsTable = (props: NewsProps) => {
    const theme = useTheme();
    const classes = useStyles(theme);
    const [searchPanelOpen, setSearchPanelOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<TableItem>();

    let lastRow = React.useRef(null);
    let lastItem = React.useRef<NewsItem>({} as NewsItem);

    const openSearchPanel = () => {
        setSearchPanelOpen(true);
    }

    const closeSearchPanel = () => {
        setSearchPanelOpen(false);
    }

    const onEquityChanged = (value: string) => {
        closeSearchPanel();
        props.equityChanged(value);
    }

    const onItemSelected = (value: TableItem) => {
        if (selectedItem !== undefined) {
            selectedItem.selected = false;
        }

        value.selected = true;
        setSelectedItem(value);
    }

    const fetchMoreData = () => {
        props.onScrollend(lastItem.current);
    }

    const intersectionObserver = React.useRef(
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target === lastRow.current) {
                    fetchMoreData();
                }
            })
        })
    );

    React.useEffect(() => {
        lastItem.current = props.datasource[props.datasource.length - 1];
    }, [props.datasource]);

    React.useEffect(() => {
        const obs = intersectionObserver;
        return () => {
            obs.current.disconnect();
        }
    }, []);

    const rowCallback = (e: HTMLDivElement) => {
        if (e !== null) {
            lastRow.current = e;
            intersectionObserver.current.observe(e);
        }
    }
    return (
        <Grid container direction="column">
            <Grid container
                alignContent="center"
                justify="flex-end"
                direction="row"
                spacing={2}
                className="action-buttons">
                <Grid item>
                    <IconButton aria-label="settings button"
                        edge="end"
                        style={{ pointerEvents: "auto", color: "white" }}
                        onClick={() => openSearchPanel()}>
                        <Icon>search</Icon>
                    </IconButton>
                </Grid>
            </Grid>
            <Drawer anchor='right'
                open={searchPanelOpen}
                variant="temporary">
                <EquitySearch equities={props.equities}
                    onChange={onEquityChanged} onClose={closeSearchPanel} />
            </Drawer>

            <Grid item>
                <Grid container direction="row" spacing={2}>
                    <Grid item xs={8}>
                        <TableContainer style={{ height: "calc(100vh - 112px)" }} >
                            <Table stickyHeader={true}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Symbol</TableCell>
                                        <TableCell>Company Name</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Sentiment</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(props.datasource as TableItem[]).map(row => (
                                        <TableRow className={row.selected ? classes.tableRowSelected : ''} key={row.id} ref={el => rowCallback(el)} onClick={() => onItemSelected(row)}>
                                            <TableCell className={row.selected ? classes.tableCellSelected : ''} scope="row">{row.companycode}</TableCell>
                                            <TableCell className={row.selected ? classes.tableCellSelected : ''} scope="row">{row.companyname}</TableCell>
                                            <TableCell className={row.selected ? classes.tableCellSelected : ''} scope="row">{new Date(row.datetime).toDateString()}</TableCell>
                                            <TableCell className={row.selected ? classes.tableCellSelected : ''} scope="row">{row.title}</TableCell>
                                            <TableCell className={row.selected ? classes.tableCellSelected : ''} scope="row">{row.sentiment}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>

                            </Table>
                        </TableContainer>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper style={{overflow: "scroll"}}>
                            {selectedItem !== undefined && <NewsView id={selectedItem.id} />}
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default NewsTable