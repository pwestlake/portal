import { FunctionComponent } from "react";
import React from "react";
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { Amplify, Auth, API } from "aws-amplify";
import awsconfig from './aws-exports';
import App from "./App";

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
  
const PrivateApp: FunctionComponent = () => {
    const [authState, setAuthState] = React.useState<AuthState>();
    const [theme, setTheme] = React.useState<string>();

    async function getTheme() {
        let sessionObject = await Auth.currentSession().catch(e => undefined);
        if (sessionObject !== undefined) {
            let idToken = sessionObject.getIdToken().getJwtToken();
            let init = {
                response: false,
                headers: { Authorization: idToken }
            }

            let result = await API.get('covid19', "/userservice/preferences/philip@pwestlake.com/theme", init)
            .catch(e =>  { return {value: "blue-dark"}});
            
            setTheme(result.value);
        }
    }

    React.useEffect(() => {
        return onAuthUIStateChange((nextAuthState, authData) => {
            setAuthState(nextAuthState);
            getTheme();
        });
    }, []);

    return authState === AuthState.SignedIn && theme ? (
            <App themeName={theme === undefined ? 'blue-dark' : theme}/>
    ) : (
        <AmplifyAuthenticator style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '32px'
          }}/>
    );
}

export default PrivateApp;