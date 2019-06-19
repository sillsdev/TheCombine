import React from "react";
import NavigationBar from "./NavigationBar/";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

export interface NavComponentProps {
  VisibleComponent: JSX.Element;
}

/*
 * Every other component besides App is rendered inside this component.
 * It displays the current visible component and other UI that should be
 * displayed on every screen of The Combine.
 */
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
