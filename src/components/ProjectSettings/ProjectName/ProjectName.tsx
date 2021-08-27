import { Button, Grid, TextField } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import { Project } from "api/models";

interface NameProps {
  project: Project;
  saveChangesToProject: (project: Project) => void;
}

interface NameState {
  projectName: string;
}

export default class ProjectName extends React.Component<NameProps, NameState> {
  constructor(props: NameProps) {
    super(props);
    this.state = {
      projectName: props.project.name,
    };
  }

  private updateName(newName: string) {
    this.props.saveChangesToProject({
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
            color={
              this.state.projectName !== this.props.project.name
                ? "primary"
                : "default"
            }
            id="project-name-save"
          >
            <Translate id="buttons.save" />
          </Button>
        </Grid>
      </Grid>
    );
  }
}
