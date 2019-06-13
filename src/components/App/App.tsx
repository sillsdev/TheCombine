//external modules
import React from "react";

export interface AppProps {
  VisibleComponent: JSX.Element;
}

export default class App extends React.Component<AppProps> {
  constructor(props: AppProps) {
    super(props);
  }

  render() {
    return <div className="App">{this.props.VisibleComponent}</div>;
  }
}
