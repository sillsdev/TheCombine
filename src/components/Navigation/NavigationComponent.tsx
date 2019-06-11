import React from "react";
import Stack from "../../types/stack";
import NavigationBar from "./NavigationBar/";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

export interface NavComponentProps {
  VisibleComponent: JSX.Element;
  DisplayHistory: Stack<JSX.Element>;
  GoBack: () => void;
}

export class Navigation extends React.Component<
  NavComponentProps & LocalizeContextProps
> {
  constructor(props: NavComponentProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div className="NavigationComponent">
        <NavigationBar />
        {this.props.VisibleComponent}
      </div>
    );
  }
}

export default withLocalize(Navigation);
