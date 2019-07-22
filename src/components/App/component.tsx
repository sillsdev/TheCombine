//external modules
import React from "react";

//TC modules
import ProjectScreen from "../ProjectScreen/ProjectScreenComponent";
import { Route, Switch } from "react-router-dom";
import { PrivateRoute } from "../PrivateRoute";
import Login from "../Login/LoginPage";
import Register from "../Login/RegisterPage";
import PageNotFound from "../PageNotFound/component";
import { GoalRoute } from "../GoalRoute/component";
import AddWords from '../AddWords';

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <PrivateRoute exact path="/" component={ProjectScreen} />
          <PrivateRoute path="/goals" component={GoalRoute} />
          <Route path="/login" component={Login} />
          <Route path="/add" component={AddWords} />
          <Route path="/register" component={Register} />
          <Route component={PageNotFound} />
        </Switch>
      </div>
    );
  }
}
