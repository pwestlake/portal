import React from "react";
import './equity-fund-view.css';
import { Auth, API } from "aws-amplify";
import { AppBar, Paper, Tab, Tabs} from "@material-ui/core";
import { EquityCatalogItemModel } from "../../../models/equitycatalogitem";
import ChartsTab from "./charts-tab";
import LatestTab from "./latest-tab";
import NewsTab from "./news-tab";


interface EquityFundViewProps {
  selectedTab: number;
  controller(index: number): void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
          <div style={{height: "calc(100vh - 112px"}}>{children}</div>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const EquityFundView = (props: EquityFundViewProps) => {
  const [catalog, setCatalog] = React.useState<EquityCatalogItemModel[]>([]);

  React.useEffect(() => {
    async function sourceAndSetData() {
      let sessionObject = await Auth.currentSession();
      let path = "/equity-fund/equitycatalog";
      
      let idToken = sessionObject.getIdToken().getJwtToken();
      let init = {
          response: true,
          headers: { Authorization: idToken },
    };

    API.get('covid19', path, init)
        .then(response => {
            setCatalog(response.data as EquityCatalogItemModel[]);
        })
        .catch(error => {
            console.log(error.response);
        });
    }
    sourceAndSetData();
  }, []); 


  const tabChanged = (event: React.ChangeEvent<{}>, newValue: number) => {
    props.controller(newValue);
  };


    return (
      <div className="main">

        <AppBar position="static" elevation={0}>
          <Tabs value={props.selectedTab} onChange={tabChanged}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="covid-19 tabs">
            <Tab label="Latest" {...a11yProps(0)} />
            <Tab label="Charts" {...a11yProps(1)} />
            <Tab label="News" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <Paper square={true} style={{width: "100vw", height: "calc(100vh - 104px)", overflow: "scroll"}}>
          <TabPanel value={props.selectedTab} index={0}>
            <LatestTab />
          </TabPanel>
          <TabPanel value={props.selectedTab} index={1}>
            <ChartsTab catalog={catalog}/>
          </TabPanel>
          <TabPanel value={props.selectedTab} index={2}>
            <NewsTab equities={catalog}/>
          </TabPanel>
        </Paper>
      </div>
    )
}

export default EquityFundView;