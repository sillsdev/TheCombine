import React from "react";

export interface NavComponentProps {
  VisibleComponent: JSX.Element;
}

export class Navigation extends React.Component<NavComponentProps> {
  constructor(props: NavComponentProps) {
    super(props);
  }

  render() {
    return (
      <div className="VisibleComponent">{this.props.VisibleComponent}</div>
    );
  }
}
