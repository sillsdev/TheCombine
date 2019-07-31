import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import { Edit } from "@material-ui/icons";

import { Project } from "../../types/project";
import { User } from "../../types/user";
import * as backend from "../../backend";
import { Paper } from "@material-ui/core";
import AppBarComponent from "../AppBar/AppBarComponent";
import LanguageSettingsComponent, {
  LanguageProps
} from "./LanguageSettingsComponent";

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
    let edit = await backend.getUserRoles(this.props.project.id);
    let settings: ProjectSettingsState = {};

    if (edit === "4") {
      settings.imports = true;
      // settings.languages = {
      //     analysis:
      // }
    }
    if (edit === "5") {
      settings.users = await backend.getAllUsers();
    }

    this.setState(settings);
  }

  render() {
    return (
      <Paper>
        <AppBarComponent />
        {this.state.languageSettings && (
          <LanguageSettingsComponent {...this.state.languageSettings} />
        )}
      </Paper>
    );
  }
}

export default withLocalize(ProjectSettingsComponent);
