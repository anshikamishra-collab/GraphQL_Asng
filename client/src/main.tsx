import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain="dev-21v35bfkf3485r4d.us.auth0.com"
    clientId="wv2rc9u6jbz4SdtAgqJ3XyDTjO8NAuWj"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "https://graph-api",
    }}
  >
    <App />
  </Auth0Provider>,
);
