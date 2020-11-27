import { Divider, Drawer, Grid, Icon, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { API, Auth } from "aws-amplify";
import React from "react";
import { useHistory } from "react-router-dom";
import { EquityCatalogItemModel } from "../../../models/equitycatalogitem";
import { NewsItem } from "../../../models/newsitem";
import EquitySearch from "./equity-search";


interface NewsTabProps {
    equities: EquityCatalogItemModel[]
}

interface NewsProps {
    datasource: NewsItem[]
    equities: EquityCatalogItemModel[];
    equityChanged(value: string): void;

}

interface NewsListProps extends NewsProps {
    itemSelected(value: string): void;
    onScrollend(offset: NewsItem): void;
}

const NewsList = (props: NewsListProps) => {
    const [searchPanelOpen, setSearchPanelOpen] = React.useState(false);
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

    const onItemSelected = (value: string) => {
        props.itemSelected(value);
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
                        style={{pointerEvents: "auto", color: "white"}}
                        onClick={() => openSearchPanel()}>
                        <Icon>search</Icon>
                    </IconButton>
                </Grid>    
            </Grid>
            <Drawer anchor='right' 
                open={searchPanelOpen} 
                variant="temporary">
                <EquitySearch equities={props.equities} 
                            onChange={onEquityChanged} onClose={closeSearchPanel}/>
            </Drawer>
            <Grid item>
                <List>
                    {props.datasource.length > 0 && props.datasource.map((row) => (
                        <div key={row.id} ref={el => rowCallback(el)}>
                            <ListItem>
                                <ListItemAvatar><Typography>{row.companycode}</Typography></ListItemAvatar>
                                <ListItemText 
                                    onClick={() => onItemSelected(row.id)}
                                    primary={
                                    <React.Fragment>
                                        <Grid container wrap="nowrap" direction="row" spacing={2} alignItems="baseline" justify="space-between">
                                            <Grid item xs zeroMinWidth>
                                                <Typography noWrap variant="subtitle1">{row.companyname}</Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography component="span" variant="body2">{new Date(row.datetime).toDateString()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </React.Fragment>}
                                    secondary={
                                        <React.Fragment>
                                            {row.sentiment !== 0 && 
                                                <Typography component="span" variant="body1"
                                                    className={row.sentiment > 0 ? 'up' : 'down'}>[{row.sentiment}] </Typography>}
                                            <Typography component="span" variant="subtitle1">{row.title}</Typography>
                                        </React.Fragment>
                                    }></ListItemText>
                            </ListItem>
                            <Divider />
                        </div>
                    ))}
                </List>
            </Grid>
        </Grid>
    )
}

const NewsTable = (props: NewsProps) => {
    return (
        <div>Table
        </div>
    )
}

const NewsTab = (props: NewsTabProps) => {
    const theme = useTheme();
    const greaterThanSm = useMediaQuery(theme.breakpoints.up('sm'));
    const [data, setData] = React.useState<NewsItem[]>([]);
    const [equity, setEquity] = React.useState<string>("");
    const [newsOffset, setNewsOffset] = React.useState<NewsItem>({} as NewsItem);
    const history = useHistory();

    const fetchData = React.useCallback(
        () => {
            async function sourceAndSetData() {
                let sessionObject = await Auth.currentSession().catch(e => undefined);
                if (sessionObject !== undefined) {
                    let idToken = sessionObject.getIdToken().getJwtToken();
                    
                    let params: any = {count: 20};
                    if (equity !== undefined && equity.length > 0) {
                        params.catalogref = equity;
                    }
    
                    if (newsOffset !== undefined && newsOffset.id !== undefined) {
                        params.key = newsOffset.id;
                        params.sortkey = newsOffset.datetime;
                    }

                    let init = {
                        response: false,
                        headers: { Authorization: idToken },
                        queryStringParameters: params
                    }
        
                    let result = await API.get('covid19', `/news/newsitems`, init)
                    .catch(e =>  { return {value: []}});
                
                    if (result.length > 0) {
                        setData((data) => data.concat(result as NewsItem[]));
                    }
                }
            }
            sourceAndSetData();
        },
        [equity, newsOffset],
    );

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const onEquityChanged = (item: string) => {
        setData([]);
        setNewsOffset({} as NewsItem);
        setEquity(item);
    }

    const onItemSelected = (item: string) => {
        history.push('/private/equity-fund/news/' + item);
    }

    const fetchMoreData = (offset: NewsItem) => {
        setNewsOffset(offset);
    }

    
    return (
        <div style={{height: "100%"}}>
            {greaterThanSm && <NewsTable equities={props.equities} equityChanged={onEquityChanged} datasource={data}/>}
            {!greaterThanSm && <NewsList equities={props.equities} 
                equityChanged={onEquityChanged} 
                itemSelected={onItemSelected}
                onScrollend={fetchMoreData}
                datasource={data}/>}
        </div>
    )
}

export default NewsTab;