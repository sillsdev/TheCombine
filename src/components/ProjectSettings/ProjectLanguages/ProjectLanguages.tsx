import React from "react";
import { Typography } from "@material-ui/core";
import { Project, WritingSystem } from "../../../types/project";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";

interface LanguageProps {
  project: Project;
}

interface LanguageState {
  projectName: string;
}

class ProjectLanguage extends React.Component<
  LanguageProps & LocalizeContextProps,
  LanguageState
> {
  constructor(props: LanguageProps & LocalizeContextProps) {
    super(props);
    this.state = {
      projectName: props.project.name,
    };
  }

  componentDidUpdate(prevProps: LanguageProps) {
    if (prevProps.project.id !== this.props.project.id) {
      let name = this.props.project.name;
      this.setState({ projectName: name });
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

export default withLocalize(ProjectLanguage);
