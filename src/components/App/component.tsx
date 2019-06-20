//external modules
import React from "react";

//TC modules
import CreateProject from "../CreateProject";
import { Route, Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import { PrivateRoute } from "../PrivateRoute";
import { LogoutButton } from "../Login/LogoutButton";
import Login from "../Login";
import Navigation from "../Navigation";

export const history = createBrowserHistory();

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Router history={history}>
          <PrivateRoute exact path="/nav" component={Navigation} />
          <PrivateRoute exact path="/" component={CreateProject} />
          <Route path="/login" component={Login} />
        </Router>
        <LogoutButton />
      </div>
    );
  }
}
