import React from "react";
import Stack from "../../types/stack";
import { NavigationBar } from "./NavigationBar/NavigationBarComponent";

export interface NavComponentProps {
  PreviousComponent: JSX.Element;
  VisibleComponent: JSX.Element;
  DisplayHistory: Stack<JSX.Element>;
  GoBack: () => void;
}

export class Navigation extends React.Component<NavComponentProps> {
  constructor(props: NavComponentProps) {
    super(props);
  }

  render() {
    return (
      <div className="NavigationComponent">
        <NavigationBar
          PreviousComponent={this.props.PreviousComponent}
          GoBack={this.props.GoBack}
        />
        {this.props.VisibleComponent}
      </div>
    );
  }
}
