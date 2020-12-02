import React, { FunctionComponent } from 'react';
import './App.css';
import { AppBar, Toolbar, IconButton, Icon, Typography, Drawer, Theme, makeStyles, createStyles, Grid, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import { Route, useHistory } from 'react-router-dom';
import { Covid19View } from './routes/private/covid19/covid19-view';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { Omit } from '@material-ui/types';
import MoreIcon from '@material-ui/icons/MoreVert';
import { grey } from '@material-ui/core/colors';
import { Auth, API } from 'aws-amplify';
import EquityFundView from './routes/private/equity-fund/equity-fund-view';
import NewsView from './routes/private/equity-fund/news-view';
import EODEditView from './routes/private/equity-fund/eod-edit-view';

interface AppProps {
  themeName: string;
}

interface ListItemLinkProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
}

export interface AppBarContext {
  title: string;
  showBackButton: boolean;
}

function ListItemLink(props: ListItemLinkProps) {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, 'to'>>((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to],
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const App: FunctionComponent<AppProps> = ({themeName}) => {
  const [title, setTitle] = React.useState<string>("");
  const [renderBackButton, setRenderBackButton] = React.useState<boolean>(false);
  const [dotpercentRole, setDotpercentRole] = React.useState(false);
    React.useEffect(() => {
        Auth.currentSession().then(session => {
            const details = session.getIdToken().decodePayload();
            const groups = details['cognito:groups'] as string[];
            if (groups !== undefined) {
                setDotpercentRole(groups.includes('dotpercent'));
            }
        });
    }, []);

  let themeMap = new Map<string, Theme>();
  const light = createMuiTheme({
    overrides: {
      MuiPaper: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
      MuiCard: {
        root: {
          backgroundColor: '#ffffff',
        },
      }
    },
    palette: {
      type: 'light',
    },
  });
  
  const dark = createMuiTheme({
    overrides: {
      MuiAppBar: { 
        colorPrimary: {
          backgroundColor: '#292929',
        },
      },
      MuiPaper: {
        root: {
          backgroundColor: grey[900],
        },
      },
      MuiCard: {
        root: {
          backgroundColor: grey.A400,
        },
      }
    },
    palette: {
      primary: {
        main: '#42a5f5',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#c8e6c9',
        contrastText: '#000000'
      },
      type: 'dark',
      contrastThreshold: 3,
      
    },
    
  });

  themeMap["blue-dark"] = dark;
  themeMap["indigo-pink-light"] = light;

  const [theme, setTheme] = React.useState(themeMap[themeName]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  async function saveTheme(name: string) {
    let sessionObject = await Auth.currentSession();
    let userid = sessionObject.getIdToken().payload["email"];
    let idToken = sessionObject.getIdToken().getJwtToken();
    
    let payload = {
      userid: userid,
      key: "theme",
      value: name
    }

    let init = {
      response: true,
      headers: { Authorization: idToken },
      body: payload
    }

    API.post('covid19', "/userservice/preferences/" + userid + "/theme", init); 

  }

  const handleClickLight = () => {
    saveTheme("indigo-pink-light");
    setTheme(light);
    setAnchorEl(null);
  };

  const handleClickDark = () => {
    saveTheme("blue-dark");
    setTheme(dark);
    setAnchorEl(null);
  };

  const handleSignout = () => {
    Auth.signOut();
  }

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const drawerWidth = 240;
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
      },
      appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      },
      toolBar: {
        
      },
      appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
      drawer: {
        width: drawerWidth,
        flexShrink: 0,
      },
      drawerPaper: {
        width: drawerWidth,
      },
      drawerContainer: {
        overflow: 'auto',
      },
      mainGrid: {
        height: '100%',
      },
      mainConent: {
        height: '100%',
        flexGrow: 1,
      },
      title: {
        flexGrow: 1,
      },
      content: {
        flexGrow: 1,
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
      },
      contentShift: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    }),
  );

  const classes = useStyles();
  const [state, setState] = React.useState(false);
  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState(open);
    
  };

  const [tab, setTab] = React.useState<number>(0);
  const tabController = (index: number) => {
    setTab(index);
  }

  const history = useHistory();
  const back = () => {
    history.goBack();
  }

  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.root}>
        <Grid container direction="column" className={classes.mainGrid}>
          <Grid item xs={12}>
            <AppBar position="static" elevation={0} className={classes.appBar}>
              <Toolbar>
                {!renderBackButton && <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(!state)}>
                  <Icon>menu</Icon>
                </IconButton>}
                {renderBackButton && <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => back()}>
                  <Icon>arrow_back</Icon>
                </IconButton>}
                <Typography variant="h6" className={classes.title}>
                  {title}
                </Typography>
                <div>
                  <IconButton aria-label="display more actions" edge="end" color="inherit" onClick={handleClick}>
                    <MoreIcon />
                  </IconButton>
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={handleSignout}>Logout</MenuItem>
                    <MenuItem onClick={handleClickLight}>Light</MenuItem>
                    <MenuItem onClick={handleClickDark}>Dark</MenuItem>
                  </Menu>
                </div>
              </Toolbar>
            </AppBar>

            <Grid container direction="row" className={classes.mainConent}>
              <Drawer className={classes.drawer} anchor='left' open={state} onClick={toggleDrawer(false)}
                variant="temporary" classes={{
                  paper: classes.drawerPaper,
                }}>
                <Typography variant="h6" style={{padding: "12px 0px 0px 12px"}}>Apps</Typography>
                <List aria-label="main menu">
                  <ListItemLink to="/private/covid19" primary="Covid-19"/>
                  {dotpercentRole &&
                  <ListItemLink to="/private/equity-fund" primary="DotPercent"/>}
                </List>
              </Drawer>

              <main
                className={classes.mainConent}
                onClick={toggleDrawer(false)}
                // className={clsx(classes.content, {
                //   [classes.contentShift]: state,
                // })}
              >
                <Route exact path="/private/covid19" render={() => {
                    setRenderBackButton(false);
                    setTitle("Covid-19"); 
                    return <Covid19View />
                  }} />

                <Route exact path="/private/equity-fund" render={() => {
                    setRenderBackButton(true);
                    setTitle("DotPercent"); 
                    return <EquityFundView selectedTab={tab} controller={tabController}/>
                  }} />

                <Route exact path="/private/equity-fund/news/:id" render={() => <NewsView />} />

                <Route exact path="/private/equity-fund/edit-price/:id" render={() => {
                    setRenderBackButton(true);
                    setTitle("Edit Price");
                    return <EODEditView />
                  }} />
              </main>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
