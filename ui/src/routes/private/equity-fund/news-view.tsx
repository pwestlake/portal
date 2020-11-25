import { AppBar, Grid, Icon, IconButton, Paper, Toolbar, Typography } from "@material-ui/core";
import { API, Auth } from "aws-amplify";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { NewsItem } from "../../../models/newsitem";

interface NewsViewProps {
}

function toHtml(text: string): string {
    let html = "";
    if (text === undefined) {
        return "";
    }

    let strings: string[] = text.split("\\n");
    
    for (let paragraph of strings) {
        html = html.concat(`<p>${paragraph}</p>`);
    }

    html = html.replace(/\\&q;/g, "\"");
    return html;
}

const NewsView = (props: NewsViewProps) => {
    const {id} = useParams<any>();
    const history = useHistory();
    const [newsItem, setNewsItem] = React.useState<NewsItem>({} as NewsItem);

    React.useEffect(() => {
        async function sourceAndSetData() {
            let sessionObject = await Auth.currentSession().catch(e => undefined);
            if (sessionObject !== undefined) {
                let idToken = sessionObject.getIdToken().getJwtToken();

                let init = {
                    response: false,
                    headers: { Authorization: idToken }
                }
    
                let result = await API.get('covid19', `/news/newsitem/${id}`, init)
                .catch(e =>  { return {value: []}});
            
                setNewsItem(result as NewsItem);
            }
        }
        
        sourceAndSetData();
    }, [id]);

    const back = () => {
        history.goBack();
    }

    return (
        <Grid container direction="column">
            <Grid item>
                <AppBar position="fixed" elevation={0}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="back-arrow" onClick={() => back()}>
                            <Icon>arrow_back</Icon>
                        </IconButton>
                        <Typography variant="h6">
                            {newsItem.title}
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Grid>
            <Grid item>
                <Paper style={{height: "calc(100vh - 56px)", overflow: "scroll", padding: "24px"}}>
                    <div dangerouslySetInnerHTML={{ __html: toHtml(newsItem.content)}}></div>
                </Paper>
            </Grid>
        </Grid>    
    )
}

export default NewsView;