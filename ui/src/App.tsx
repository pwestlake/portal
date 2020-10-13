import React from 'react';
import './App.css';
import { withAuthenticator } from "@aws-amplify/ui-react";
import { AppBar, Toolbar, IconButton, Icon, Typography, Drawer, Theme, makeStyles, createStyles, Grid, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Route } from 'react-router-dom';
import { Covid19View } from './routes/covid19/covid19-view';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { Omit } from '@material-ui/types';

interface ListItemLinkProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
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

function App() {
  const drawerWidth = 240;
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        height: '100%',
        display: 'flex',
        flexGrow: 1,
      },
      appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
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

  return (
    <div className={classes.root}>
      <Grid container direction="column" alignItems="stretch" className={classes.mainGrid}>
        <Grid item xs={12}>
          <AppBar position="static" elevation={0} className={classes.appBar}>
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(!state)}>
                <Icon>menu</Icon>
              </IconButton>
              <Typography variant="h6">
                Portal
              </Typography>
            </Toolbar>
          </AppBar>

          <Grid container direction="row" alignItems="stretch" className={classes.mainConent}>
            <Drawer className={classes.drawer} anchor='left' open={state} onClick={toggleDrawer(false)}
              variant="temporary" classes={{
                paper: classes.drawerPaper,
              }}>
              <h3>Charts</h3>
              <List aria-label="main menu">
                <ListItemLink to="/covid19" primary="Covid-19" />
            
              </List>
            </Drawer>

            <main
              className={classes.mainConent}
              onClick={toggleDrawer(false)}
              // className={clsx(classes.content, {
              //   [classes.contentShift]: state,
              // })}
            >
              <Route exact path="/covid19" render={() => <Covid19View />} />
              
            </main>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default withAuthenticator(App);
