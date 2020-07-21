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

  getAnalysisLangNames() {
    let names: string[] = [
      "read, ",
      "this, ",
      "before, ",
      "you, ",
      "give, ",
      "up, ",
    ];
    for (let languages of this.props.project.analysisWritingSystems) {
      names.push(languages.concat(", "));
    }
    let tempName = names[names.length - 1];
    names[names.length - 1] = tempName.substr(0, tempName.length - 2);
    return names;
  }

  getVernLang() {
    let result: string = this.props.project.vernacularWritingSystem;
    result = "The writing system does not work right now";
    return result;
  }

  render() {
    return (
      <React.Fragment>
        <Typography>
          <Translate id="projectSettings.language.vernacular" />
          {": "}
          {this.getVernLang()}
        </Typography>
        <Typography>
          <Translate id="projectSettings.language.analysis" />
          {": "}
          {this.getAnalysisLangNames()}
        </Typography>
      </React.Fragment>
    );
  }
}

export default withLocalize(ProjectName);
