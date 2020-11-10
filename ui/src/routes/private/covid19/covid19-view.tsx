import React from "react";
import './covid19-view.css';
import { Typography, AppBar, Tabs, Tab, Paper } from "@material-ui/core";
import { SummaryTab } from "./summary-tab";
import { CountryTab } from "./country-tab";
import DataTab from "./data-tab";
import { Auth, API } from "aws-amplify";

interface Covid19ViewState {
  tab: number;
  regions: string[];
}

interface Covid19ViewProps {
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

export class Covid19View extends React.Component<Covid19ViewProps, Covid19ViewState> {


  constructor(props: any) {
    super(props);
    this.state = {
      tab: 0,
      regions: []
    };
  }

  async componentDidMount() {
    let sessionObject = await Auth.currentSession();
    let path = "/regions";
    
    let idToken = sessionObject.getIdToken().getJwtToken();
    let init = {
        response: true,
        headers: { Authorization: idToken },
    };
    API.get('covid19', path, init)
        .then(response => {
            this.setState({ regions: response.data as string[] });
        })
        .catch(error => {
            console.log(error.response);
        });
  }

  tabChanged = (event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({ tab: newValue });
  };

  render() {
    return <div className="main">

      <AppBar position="static" elevation={0}>
        <Tabs value={this.state.tab} onChange={this.tabChanged}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="covid-19 tabs">
          <Tab label="Summary" {...a11yProps(0)} />
          <Tab label="Country" {...a11yProps(1)} />
          <Tab label="Data" {...a11yProps(2)} />
          <Tab label="Topic" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <Paper square={true} style={{width: "100vw", height: "calc(100vh - 112px)", overflow: "scroll"}}>
        <TabPanel value={this.state.tab} index={0}>
          <SummaryTab />
        </TabPanel>
        <TabPanel value={this.state.tab} index={1}>
          <CountryTab regions={this.state.regions}/>  
        </TabPanel>
        <TabPanel value={this.state.tab} index={2}>
          <DataTab regions={this.state.regions}/>
        </TabPanel>
        <TabPanel value={this.state.tab} index={3}>
        <Typography>Item Two</Typography>
        </TabPanel>
      </Paper>


    </div>
  }
}