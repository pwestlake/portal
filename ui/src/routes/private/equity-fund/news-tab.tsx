import { useMediaQuery, useTheme } from "@material-ui/core";
import { API, Auth } from "aws-amplify";
import React from "react";
import { useHistory } from "react-router-dom";
import { EquityCatalogItemModel } from "../../../models/equitycatalogitem";
import { NewsItem } from "../../../models/newsitem";
import NewsList from "./news-tab-list";
import NewsTable from "./news-tab-table";


interface NewsTabProps {
    equities: EquityCatalogItemModel[]
}

export interface NewsProps {
    datasource: NewsItem[]
    equities: EquityCatalogItemModel[];
    equityChanged(value: string): void;
    onScrollend(offset: NewsItem): void;

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
            {greaterThanSm && <NewsTable equities={props.equities} 
                equityChanged={onEquityChanged} 
                onScrollend={fetchMoreData}
                datasource={data}/>}
            {!greaterThanSm && <NewsList equities={props.equities} 
                equityChanged={onEquityChanged} 
                itemSelected={onItemSelected}
                onScrollend={fetchMoreData}
                datasource={data}/>}
        </div>
    )
}

export default NewsTab;