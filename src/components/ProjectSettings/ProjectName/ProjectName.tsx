import { Button, Grid, TextField } from "@mui/material";
import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";

import { Project } from "api/models";

interface NameProps extends WithTranslation {
  project: Project;
  saveChangesToProject: (project: Project) => Promise<void>;
}

interface NameState {
  projectName: string;
}

export class ProjectName extends React.Component<NameProps, NameState> {
  constructor(props: NameProps) {
    super(props);
    this.state = {
      projectName: props.project.name,
    };
  }

  private async updateName(newName: string) {
    await this.props.saveChangesToProject({
      ...this.props.project,
      name: newName,
    });
  }

  componentDidUpdate(prevProps: NameProps) {
    if (prevProps.project.id !== this.props.project.id) {
      this.setState((_, props) => ({ projectName: props.project.name }));
    }
  }

  render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            variant="standard"
            id="project-name"
            value={this.state.projectName}
            onChange={(e) => this.setState({ projectName: e.target.value })}
            onBlur={(e) => this.updateName(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            // No onClick necessary, as name updates on blur away from TextField.
            variant="contained"
            color="primary"
            id="project-name-save"
          >
            {this.props.t("buttons.save")}
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withTranslation()(ProjectName);
