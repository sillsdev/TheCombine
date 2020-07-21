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

  componentDidUpdate(prevProps: NameProps) {
    if (prevProps.project.id !== this.props.project.id) {
      this.setState({ projectName: this.props.project.name });
    }
  }

  render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12}></Grid>
        <Grid item></Grid>
      </Grid>
    );
  }
}

export default withLocalize(ProjectName);
