import React from "react";
import { TextField, Grid, Button } from "@material-ui/core";

import { updateProject } from "../../../backend";
import { Project } from "../../../types/project";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";

interface NameProps {
  project: Project;
  setCurrentProject: (project: Project) => void;
}

interface NameState {
  projectName: string;
}

class ProjectName extends React.Component<
  NameProps & LocalizeContextProps,
  NameState
> {
  constructor(props: NameProps & LocalizeContextProps) {
    super(props);
    this.state = {
      projectName: props.project.name,
    };
  }

  private updateName(newName: string) {
    // Update backend
    updateProject({
      ...this.props.project,
      name: newName,
    });

    // Update redux store
    this.props.setCurrentProject({
      ...this.props.project,
      name: newName,
    });
  }

  componentDidUpdate(prevProps: NameProps) {
    if (prevProps.project.id !== this.props.project.id) {
      this.setState({ projectName: this.props.project.name });
    }
  }

  render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            value={this.state.projectName}
            onChange={(e) => this.setState({ projectName: e.target.value })}
            onBlur={(e) => this.updateName(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color={
              this.state.projectName !== this.props.project.name
                ? "primary"
                : "default"
            }
            onClick={() => this.updateName(this.state.projectName)}
          >
            <Translate id="buttons.save" />
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(ProjectName);
