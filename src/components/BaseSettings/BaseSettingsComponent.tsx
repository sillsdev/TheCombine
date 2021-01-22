import { Grid, Typography } from "@material-ui/core";
import React, { ReactNode } from "react";

import theme from "types/theme";

interface SettingsProps {
  title: ReactNode;
  icon: ReactNode;
  body: ReactNode;
}

interface SettingsState {
  isVisible: boolean;
}

export default class BaseSettingsComponent extends React.Component<
  SettingsProps,
  SettingsState
> {
  constructor(props: SettingsProps) {
    super(props);
    this.state = { isVisible: true };
  }

  toggleVisibility() {
    this.setState((prevState) => ({
      isVisible: !prevState.isVisible,
    }));
  }

  render() {
    return (
      <Grid item container xs={12} spacing={2} style={{ flexWrap: "nowrap" }}>
        <Grid
          item
          style={{ marginTop: 4, color: "grey" }}
          onClick={() => this.toggleVisibility()}
        >
          {this.props.icon}
        </Grid>
        <Grid item>
          <Typography
            variant="h6"
            style={{
              marginBottom: this.state.isVisible ? theme.spacing(2) : 0,
            }}
            onClick={() => this.toggleVisibility()}
          >
            {this.props.title}
          </Typography>
          {this.state.isVisible && this.props.body}
        </Grid>
      </Grid>
    );
  }
}
