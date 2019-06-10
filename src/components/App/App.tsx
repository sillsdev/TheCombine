//external modules
import React from "react";

//TC modules
import Temp from "../Temp";
import Login from "../Login";
import CreateProject from "../CreateProject";
import { Route, Router } from "react-router-dom";
import { createBrowserHistory } from "history";
import { PrivateRoute } from "../PrivateRoute";

export const history = createBrowserHistory();

const App: React.FC = () => {
  return (
    <div className="App">
      <Temp />
      <Router history={history}>
        <PrivateRoute exact path="/" component={CreateProject} />
        <Route path="/login" component={Login} />
      </Router>
    </div>
  );
};

export default App;
