import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { Project, WritingSystem } from "../../../types/project";
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

  getAnalysisLang() {
    let analysisLang: WritingSystem = this.props.project
      .vernacularWritingSystem;

    return analysisLang;
  }

  getVernLang() {
    let vernacularLang: WritingSystem = this.props.project
      .vernacularWritingSystem;
    return vernacularLang;
  }

  render() {
    return (
      <React.Fragment>
        <Typography>
          <Translate id="projectSettings.language.vernacular" />
          {": "}
          {this.getVernLang().name}
          {this.getVernLang().bcp47}
          {this.getVernLang().font}
        </Typography>
        <Typography>
          <Translate id="projectSettings.language.analysis" />
          {": "}
          {this.getAnalysisLang().name}
          {this.getAnalysisLang().bcp47}
          {this.getAnalysisLang().font}
        </Typography>
      </React.Fragment>
    );
  }
}

export default withLocalize(ProjectName);
