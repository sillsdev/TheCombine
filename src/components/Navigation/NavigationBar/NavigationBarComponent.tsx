import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import KeyboardBackspace from "@material-ui/icons/KeyboardBackspace";

export interface NavBarProps {
  PreviousComponent: JSX.Element;
  GoBack: () => void;
}

export class NavigationBar extends React.Component<NavBarProps> {
  constructor(props: NavBarProps) {
    super(props);
  }

  render() {
    return (
      <div className="VisibleComponent">
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start">
              <KeyboardBackspace />
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}
