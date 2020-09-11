import { Button, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { updateProject } from "../../../backend";
import { Project, WritingSystem } from "../../../types/project";
import theme from "../../../types/theme";
import EditableWritingSystem, {
  ImmutableWritingSystem,
} from "./EditableWritingSystem";

interface LanguageProps {
  project: Project;
}

interface LanguageStates {
  add?: boolean;
}

class ProjectLanguages extends React.Component<
  LanguageProps & LocalizeContextProps,
  LanguageStates
> {
  updateProjectWritingSystem(ws: WritingSystem, index?: number) {
    let updatedProject: Project;
    if (index === undefined) {
      updatedProject = { ...this.props.project, vernacularWritingSystem: ws };
    } else {
      const updatedAnalysisWS: WritingSystem[] = [
        ...this.props.project.analysisWritingSystems,
      ];
      updatedAnalysisWS[index] = ws;
      updatedProject = {
        ...this.props.project,
        analysisWritingSystems: updatedAnalysisWS,
      };
    }

    updateProject(updatedProject).catch(() =>
      console.log("failed: " + updatedProject)
    );
  }

  toggleAdd() {
    const add = !this.state.add;
    this.setState({ add });
  }

  render() {
    return (
      <React.Fragment>
        <Typography>
          <Translate id="projectSettings.language.vernacular" />
          {": "}
          <ImmutableWritingSystem
            ws={this.props.project.vernacularWritingSystem}
          />
        </Typography>
        <Typography style={{ marginTop: theme.spacing(1) }}>
          <Translate id="projectSettings.language.analysis" />
          {": "}
          {this.props.project.analysisWritingSystems.map(
            (writingSystem, index) => (
              <EditableWritingSystem
                ws={writingSystem}
                index={index}
                update={this.updateProjectWritingSystem}
              />
            )
          )}
          {this.state.add ? null : (
            <Button onClick={() => this.toggleAdd()}>
              <Add />
            </Button>
          )}
        </Typography>
      </React.Fragment>
    );
  }
}

export default withLocalize(ProjectLanguages);
