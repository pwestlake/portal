import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

//Amplify.configure(awsconfig);
Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: awsconfig.aws_cognito_region,
    userPoolId: awsconfig.aws_user_pools_id,
    identityPoolId: awsconfig.aws_cognito_identity_pool_id,
    userPoolWebClientId: awsconfig.aws_user_pools_web_client_id
  },
  API: {
    endpoints: [
        {
            name: "covid19",
            endpoint: 'https://9iamktjo13.execute-api.eu-west-2.amazonaws.com/Prod/',
            region: awsconfig.aws_cognito_region
        },
    ]
  }}
)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
