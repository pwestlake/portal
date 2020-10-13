import React from "react";
import './covid19-view.css';
import { Box, Typography, AppBar, Tabs, Tab } from "@material-ui/core";
import { SummaryTab } from "./summary-tab";

interface Covid19ViewState {
  tab: number;
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
        <Box p={3}>
          <div>{children}</div>
        </Box>
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
    };
  }

  tabChanged = (event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({ tab: newValue });
  };

  render() {
    return <div className="main">

      <AppBar position="static" elevation={0}>
        <Tabs value={this.state.tab} onChange={this.tabChanged}
          variant="scrollable"
          scrollButtons="on"
          aria-label="covid-19 tabs">
          <Tab label="Summary" {...a11yProps(0)} />
          <Tab label="Country" {...a11yProps(1)} />
          <Tab label="Data" {...a11yProps(2)} />
          <Tab label="Topic" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={this.state.tab} index={0}>
        <SummaryTab />
      </TabPanel>
      <TabPanel value={this.state.tab} index={1}>
        
      </TabPanel>
      <TabPanel value={this.state.tab} index={2}>
      <Typography>Item Two</Typography>
      </TabPanel>
      <TabPanel value={this.state.tab} index={3}>
      <Typography>Item Two</Typography>
      </TabPanel>


    </div>
  }
}