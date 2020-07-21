import React from "react";
import { Grid, Typography } from "@material-ui/core";
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
      <React.Fragment>
        <Typography>
          <Translate id="projectSettings.language.vernacular" />
          {": "}
          {this.props.project.vernacularWritingSystem}
        </Typography>
        <Typography>
          <Translate id="projectSettings.language.analysis" />
          {": "}
          {this.props.project.name}
        </Typography>
      </React.Fragment>
    );
  }
}

export default withLocalize(ProjectName);
