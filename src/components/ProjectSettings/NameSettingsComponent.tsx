import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import { Grid, Typography, TextField } from "@material-ui/core";
import { Create } from "@material-ui/icons";

import * as backend from "../../backend";
import { Project } from "../../types/project";

interface NameProps {
  project: Project;
}

interface NameState {
  projectName: string;
}

class NameSettingsComponent extends React.Component<
  NameProps & LocalizeContextProps,
  NameState
> {
  constructor(props: NameProps & LocalizeContextProps) {
    super(props);
    this.state = {
      projectName: this.props.project.name
    };
  }

  private changeName(
    event: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    this.setState({ projectName: event.target.value });
  }

  private updateName() {
    backend.updateProject({
      ...this.props.project,
      name: this.state.projectName
    });
  }

  render() {
    return (
      <Grid container direction={"column"}>
        <Grid item style={{ display: "flex", flexWrap: "nowrap" }}>
          <Create />
          <Typography variant="h6">
            <Translate id="settings.name" />
          </Typography>
        </Grid>
        <Grid item>
          <TextField
            value={this.state.projectName}
            onChange={e => this.changeName(e)}
            onBlur={() => this.updateName()}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(NameSettingsComponent);
