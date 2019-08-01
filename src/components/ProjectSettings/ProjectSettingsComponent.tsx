import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";

import { Project } from "../../types/project";
import { User } from "../../types/user";
import * as backend from "../../backend";
import { Paper, Container } from "@material-ui/core";
import AppBarComponent from "../AppBar/AppBarComponent";
import LanguageSettingsComponent, {
  LanguageProps
} from "./LanguageSettingsComponent";
import ImportSettingsComponent from "./ImportSettingsComponent";
import { UserRole } from "../../types/userRole";

interface ProjectSettingsProps {
  project: Project;
}

interface ProjectSettingsState {
  languageSettings?: LanguageProps;
  projectName?: string;
  imports?: boolean;
  users?: User[];
}

class ProjectSettingsComponent extends React.Component<
  ProjectSettingsProps & LocalizeContextProps,
  ProjectSettingsState
> {
  async componentWillMount() {
    let allPermissions: UserRole[] = await backend.getUserRoles(
      this.props.project.id
    );
    let currentRole: UserRole | undefined = allPermissions.find(
      value => value.projectId === this.props.project.id
    );
    let settings: ProjectSettingsState = {};

    if (currentRole)
      for (let role of currentRole.permissions) {
        if (role === 4) {
          settings.imports = true;
          settings.languageSettings = {
            vernacular: this.props.project.vernacularWritingSystem,
            analysis: [...this.props.project.analysisWritingSystems],
            uiLang: this.props.activeLanguage.code
          };
        }
        if (role === 5) {
          settings.users = await backend.getAllUsersInCurrentProject();
        }
      }

    this.setState(settings);
  }

  render() {
    return (
      <Container>
        <AppBarComponent />
        <Paper>
          {this.state &&
            this.state.languageSettings &&
            LanguageSettingsComponent(this.state.languageSettings)}
        </Paper>
        <Paper>
          {this.state && this.state.imports && (
            <ImportSettingsComponent project={this.props.project} />
          )}
        </Paper>
      </Container>
    );
  }
}

export default withLocalize(ProjectSettingsComponent);
