//external modules
import React from "react";
import { createBrowserHistory } from "history";

export interface AppProps {
  VisibleComponent: JSX.Element;
}

export const history = createBrowserHistory();

export default class App extends React.Component<AppProps> {
  constructor(props: AppProps) {
    super(props);
  }

  render() {
    return <div className="App">{this.props.VisibleComponent}</div>;
  }
}
