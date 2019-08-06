import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Grid } from "@material-ui/core";

import { Project } from "../../types/project";
import * as backend from "../../backend";
import AppBarComponent from "../AppBar/AppBarComponent";
import { UserRole } from "../../types/userRole";

import LanguageSettingsComponent, {
  LanguageProps
} from "./Language/LanguageSettingsComponent";
import ProjectImport from "./ProjectImport";
import ProjectName from "./ProjectName";
import UserSettingsComponent from "./UserSettingsComponent";
import BaseSettingsComponent from "./BaseSettingsComponent/BaseSettingsComponent";
import { Edit, Create } from "@material-ui/icons";
import CreateProject from "../ProjectScreen/CreateProject";

interface ProjectSettingsProps {
  project: Project;
}

interface ProjectSettingsState {
  languageSettings?: LanguageProps;
  projectName?: string;
  imports?: boolean;
  editUsers?: boolean;
}

class ProjectSettingsComponent extends React.Component<
  ProjectSettingsProps & LocalizeContextProps,
  ProjectSettingsState
> {
  constructor(props: ProjectSettingsProps & LocalizeContextProps) {
    super(props);
    this.state = {};
  }

  async componentWillMount() {
    let allPermissions: UserRole[] = await backend.getUserRoles();
    let currentRole: UserRole | undefined = allPermissions.find(
      value => value.projectId === this.props.project.id
    );
    let settings: ProjectSettingsState = {};

    if (currentRole)
      for (let role of currentRole.permissions) {
        if (role === 4) {
          settings.projectName = this.props.project.name;
          settings.languageSettings = {
            vernacular: this.props.project.vernacularWritingSystem,
            analysis: [...this.props.project.analysisWritingSystems],
            uiLang: this.props.activeLanguage.code
          };
          settings.imports = await backend.getLiftUploaded();
        }
        if (role === 5) settings.editUsers = true;
      }

    this.setState(settings);
  }

  render() {
    return (
      <React.Fragment>
        <AppBarComponent />
        <Grid container spacing={5}>
          {/* Project name */}
          {this.state.projectName && (
            <BaseSettingsComponent
              icon={<Edit />}
              title={<Translate id="projectSettings.name" />}
              body={<ProjectName />}
            />
          )}

          {/* Language settings */}
          {this.state.languageSettings && (
            <LanguageSettingsComponent {...this.state.languageSettings} />
          )}

          {/* Upload file */}
          {this.state.imports && <ProjectImport project={this.props.project} />}

          {this.state.editUsers && <UserSettingsComponent />}
        </Grid>
      </React.Fragment>
    );
  }
}

export default withLocalize(ProjectSettingsComponent);
