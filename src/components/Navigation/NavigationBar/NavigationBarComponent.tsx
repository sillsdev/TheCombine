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
  render() {
    return (
      <div className="VisibleComponent">
        {
          <AppBar position="static">
            <Toolbar>
              {this.props.ShouldRenderBackButton ? (
                <IconButton edge="start" onClick={this.props.GoBack}>
                  <KeyboardBackspace />
                </IconButton>
              ) : null}
            </Toolbar>
          </AppBar>
        }
      </div>
    );
  }
}

export default withLocalize(NavigationBar);
