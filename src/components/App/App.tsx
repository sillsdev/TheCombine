//external modules
import React from "react";
import { createBrowserHistory } from "history";

export interface AppProps {
  VisibleComponent: JSX.Element;
}
import axios from "axios";
import { authHeader } from "../Login/AuthHeaders";
import { Button } from "@material-ui/core";

export const history = createBrowserHistory();

export default class App extends React.Component<AppProps> {
  constructor(props: AppProps) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        {this.props.VisibleComponent}
        {/* <Router history={history}>
    <PrivateRoute exact path="/" component={CreateProject} />
    <PrivateRoute exact path="/" component={GoalView} />
    <Route path="/login" component={Login} />
  </Router> */}
      <Button
        onClick={() => {
          axios
            .get("https://localhost:5001/v1/users", {
              headers: authHeader()
            })
            .catch(err => console.log(err))
            .then(res => console.log(res));
        }}
      >
        Log users to console
      </Button>
      </div>
    );
  }
}
