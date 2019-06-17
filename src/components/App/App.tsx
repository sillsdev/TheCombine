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

export const history = createBrowserHistory();

const App: React.FC = () => {
  return (
    <div className="App">
      <Temp />
      <LogoutButton />
      <Router history={history}>
        <PrivateRoute exact path="/" component={CreateProject} />
        <Route path="/login" component={Login} />
      </Router>
    </div>
  );
};

export default App;
