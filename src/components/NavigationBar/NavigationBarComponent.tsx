import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

export interface NavBarProps {
  Title: string;
}

/*
 * The navigation bar provides the UI for navigating around The Combine.
 */
export class NavigationBar extends React.Component<
  NavBarProps & LocalizeContextProps
> {
  constructor(props: NavBarProps & LocalizeContextProps) {
    super(props);
  }

  // Render the different UI elements in the nav bar based on this
  // component's props
  render() {
    return (
      <div className="NavigationBar">
        {
          <AppBar position="static">
            <Toolbar />
          </AppBar>
        }
      </div>
    );
  }
}

export default withLocalize(NavigationBar);
