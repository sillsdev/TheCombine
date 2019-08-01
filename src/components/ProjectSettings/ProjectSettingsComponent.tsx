import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import { Grid, Container } from "@material-ui/core";

import { Project } from "../../types/project";
import { User } from "../../types/user";
import * as backend from "../../backend";
import AppBarComponent from "../AppBar/AppBarComponent";
import { UserRole } from "../../types/userRole";

import NameSettingsComponent from "./NameSettingsComponent";
import LanguageSettingsComponent, {
  LanguageProps
} from "./LanguageSettingsComponent";
import ImportSettingsComponent from "./ImportSettingsComponent";
import theme from "../../types/theme";
import UserSettingsComponent from "./UserSettingsComponent";

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
        <Grid container direction="column" spacing={2}>
          {/* Language settings */}
          {this.state.languageSettings && (
            <Grid item>
              <LanguageSettingsComponent {...this.state.languageSettings} />
            </Grid>
          )}

          {/* Project name */}
          {this.state.projectName && (
            <Grid item>
              <NameSettingsComponent project={this.props.project} />
            </Grid>
          )}

          {/* Upload file */}
          {this.state.imports && (
            <Grid item>
              <ImportSettingsComponent project={this.props.project} />
            </Grid>
          )}

          {this.state.users && (
            <UserSettingsComponent
              users={this.state.users.map(user => ({
                ...user,
                role: "a role"
              }))}
            />
          )}
        </Grid>
      </Container>
    );
  }
}

export default withLocalize(ProjectSettingsComponent);
