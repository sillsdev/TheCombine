import { Typography } from "@material-ui/core";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { updateProject } from "../../../backend";
import { Project, WritingSystem } from "../../../types/project";
import theme from "../../../types/theme";
import EditableWritingSystem from "./EditableWritingSystem";

interface LanguageProps {
  project: Project;
}

class ProjectLanguages extends React.Component<
  LanguageProps & LocalizeContextProps
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

  render() {
    return (
      <React.Fragment>
        <Typography>
          <Translate id="projectSettings.language.vernacular" />
          {": "}
          <EditableWritingSystem
            ws={this.props.project.vernacularWritingSystem}
            update={this.updateProjectWritingSystem}
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
        </Typography>
      </React.Fragment>
    );
  }
}

export default withLocalize(ProjectLanguages);
