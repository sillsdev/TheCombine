//external modules
import React from "react";

//TC modules
import CreateProject from "../CreateProject";
import { Route, Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import { PrivateRoute } from "../PrivateRoute";
import { LogoutButton } from "../Login/LogoutButton";
import Login from "../Login";
import Temp from "../Temp";
import axios from "axios";
import { authHeader } from "../Login/AuthHeaders";
import { Button } from "@material-ui/core";
import CharInventoryCreation from "../../goals/CharInventoryCreation";

export interface AppProps {
  VisibleComponent: JSX.Element;
}

export const history = createBrowserHistory();

export default class App extends React.Component<AppProps> {
  constructor(props: AppProps) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        <Temp />
        <LogoutButton />
        <Router history={history}>
          <PrivateRoute exact path="/" component={CharInventoryCreation} />
          <Route path="/login" component={Login} />
        </Router>
      </div>
    );
  }
}
