import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";
import {
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import {
  CloudUpload,
  Edit,
  GetApp,
  List,
  People,
  Sms,
} from "@material-ui/icons";

import * as backend from "../../backend";
import { AutoComplete } from "../../types/AutoComplete";
import { CurrentTab } from "../../types/currentTab";
import { Project } from "../../types/project";
import { UserRole } from "../../types/userRole";
import AppBarComponent from "../AppBar/AppBarComponent";
import BaseSettingsComponent from "../BaseSettings/BaseSettingsComponent";
import { LanguageProps } from "./Language/LanguageSettings";
import ProjectImport from "./ProjectImport";
import ProjectName from "./ProjectName";
import ExportProjectButton from "./ProjectExport/ExportProjectButton";
import ProjectUsers from "./ProjectUsers";
import ProjectSwitch from "./ProjectSwitch";

interface ProjectSettingsProps {
  project: Project;
}

interface ProjectSettingsState {
  languageSettings?: LanguageProps;
  projectName?: string;
  imports?: boolean;
  editUsers?: boolean;
  autocompleteSetting?: AutoComplete;
  loading: boolean;
}

class ProjectSettingsComponent extends React.Component<
  ProjectSettingsProps & LocalizeContextProps,
  ProjectSettingsState
> {
  constructor(props: ProjectSettingsProps & LocalizeContextProps) {
    super(props);
    this.state = { loading: true };
  }

  componentWillMount() {
    this.getSettings();
  }

  private async getSettings() {
    let allPermissions: UserRole[] = await backend.getUserRoles();
    let currentRole: UserRole | undefined = allPermissions.find(
      (value) => value.projectId === this.props.project.id
    );
    let settings: ProjectSettingsState = { ...this.state };

    if (currentRole)
      for (let role of currentRole.permissions) {
        if (role === 4) {
          settings.projectName = this.props.project.name;
          settings.languageSettings = {
            vernacular: this.props.project.vernacularWritingSystem,
            analysis: [...this.props.project.analysisWritingSystems],
            uiLang: this.props.activeLanguage.code,
          };
          settings.autocompleteSetting = this.props.project.autocompleteSetting;
          settings.imports = await backend.canUploadLift();
        }
        if (role === 5) settings.editUsers = true;
      }
    settings.loading = false;
    this.setState(settings);
  }

  async componentDidUpdate(prevProps: ProjectSettingsProps) {
    if (prevProps.project.name !== this.props.project.name) {
      this.getSettings();
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <React.Fragment>
          <AppBarComponent currentTab={CurrentTab.ProjectSettings} />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <AppBarComponent currentTab={CurrentTab.ProjectSettings} />
          <Grid container justify="center" spacing={6}>
            {/* Project List */}
            <BaseSettingsComponent
              icon={<List />}
              title={<Translate id="projectSettings.projectList" />}
              body={<ProjectSwitch />}
            />

            {/* Project name */}
            {this.props.project.name && (
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

            <BaseSettingsComponent
              icon={<Sms />}
              title={<Translate id="projectSettings.autocomplete.label" />}
              body={
                <FormControl>
                  <Select
                    value={this.props.project.autocompleteSetting}
                    onChange={(
                      event: React.ChangeEvent<{
                        name?: string;
                        value: unknown;
                      }>
                    ) => {
                      this.props.project.autocompleteSetting = event.target
                        .value as AutoComplete;
                      this.setState({
                        autocompleteSetting: event.target.value as AutoComplete,
                      });
                      backend
                        .updateProject(this.props.project)
                        .catch(() =>
                          console.log(
                            "failed: " + this.props.project.autocompleteSetting
                          )
                        );
                    }}
                  >
                    <MenuItem value="Off">
                      <Translate id="projectSettings.autocomplete.off" />
                    </MenuItem>
                    <MenuItem value="OnRequest">
                      <Translate id="projectSettings.autocomplete.request" />
                    </MenuItem>
                    <MenuItem value="AlwaysOn">
                      <Translate id="projectSettings.autocomplete.always" />
                    </MenuItem>
                  </Select>
                </FormControl>
              }
            />

            {/* Add users to project */}
            {this.state.projectName && (
              <BaseSettingsComponent
                icon={<People />}
                title={<Translate id="projectSettings.user.header" />}
                body={<ProjectUsers />}
              />
            )}
          </Grid>
        </React.Fragment>
      );
    }
  }
}

export default withLocalize(ProjectSettingsComponent);
