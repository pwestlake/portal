import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import BootstrapApp from './BootstrapApp';
import * as serviceWorker from './serviceWorker';
import Helmet from 'react-helmet';

const Main: Function = async () => {


  ReactDOM.render(
    <React.StrictMode>
      <Helmet>
        <title>Portal</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Helmet>
    
      <BootstrapApp />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

Main();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
