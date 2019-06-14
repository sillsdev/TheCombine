import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import KeyboardBackspace from "@material-ui/icons/KeyboardBackspace";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

export interface NavBarProps {
  ShouldRenderBackButton: boolean;
  GoBack: () => void;
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
  renderNavigationBar(): JSX.Element {
    if (this.props.ShouldRenderBackButton) {
      return (
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" onClick={this.props.GoBack}>
              <KeyboardBackspace />
            </IconButton>
          </Toolbar>
        </AppBar>
      );
    }
    return (
      <AppBar position="static">
        <Toolbar />
      </AppBar>
    );
  }

  render() {
    return <div className="VisibleComponent">{this.renderNavigationBar()}</div>;
  }
}

export default withLocalize(NavigationBar);
