import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Grid, Typography } from "@material-ui/core";

import { Project } from "../../types/project";
import * as backend from "../../backend";
import AppBarComponent from "../AppBar/AppBarComponent";
import { UserRole } from "../../types/userRole";

import LanguageSettings, { LanguageProps } from "./Language/LanguageSettings";
import ProjectImport from "./ProjectImport";
import ProjectName from "./ProjectName";
import UserSettingsComponent from "./UserSettingsComponent";
import BaseSettingsComponent from "./BaseSettingsComponent/BaseSettingsComponent";
import { Edit, CloudUpload, GetApp, Language } from "@material-ui/icons";
import ExportProjectButton from "./ProjectExport/ExportProjectButton";

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
          settings.imports = await backend.canUploadLift();
        }
        if (role === 5) settings.editUsers = true;
      }

    this.setState(settings);
  }

  render() {
    return (
      <React.Fragment>
        <AppBarComponent />
        <Grid container justify="center" spacing={3}>
          {/* Project name */}
          {this.state.projectName && (
            <BaseSettingsComponent
              icon={<Edit />}
              title={<Translate id="projectSettings.name" />}
              body={<ProjectName />}
            />
          )}

          {/* Import Lift file */}
          <BaseSettingsComponent
            icon={<CloudUpload />}
            title={<Translate id="projectSettings.import.header" />}
            body={
              this.state.imports ? (
                <ProjectImport />
              ) : (
                <Typography variant="caption">
                  <Translate id="projectSettings.import.notAllowed" />
                </Typography>
              )
            }
          />

          {/* Export Lift file */}
          <BaseSettingsComponent
            icon={<GetApp />}
            title={<Translate id="projectSettings.export" />}
            body={<ExportProjectButton />}
          />

          {/* Language settings */}
          {this.state.languageSettings && (
            <BaseSettingsComponent
              icon={<Language />}
              title={<Translate id="projectSettings.language.header" />}
              body={<LanguageSettings {...this.state.languageSettings} />}
            />
          )}

          {/* Add users to project - Not fully implemented yet */}
          {/* {this.state.editUsers && <UserSettingsComponent />} */}
        </Grid>
      </React.Fragment>
    );
  }
}

export default withLocalize(ProjectSettingsComponent);
