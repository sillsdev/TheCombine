import { Grid, Typography } from "@material-ui/core";
import {
  Archive,
  Assignment,
  CloudUpload,
  Edit,
  GetApp,
  List,
  People,
  PersonAdd,
  Sms,
  Language,
} from "@material-ui/icons";
import { useEffect, useMemo, useState } from "react";
import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { Permission } from "api/models";
import * as backend from "backend";
import { getCurrentUser } from "backend/localStorage";
import history, { Path } from "browserHistory";
import BaseSettingsComponent from "components/BaseSettings/BaseSettingsComponent";
import { asyncRefreshCurrentProjectUsers } from "components/Project/ProjectActions";
import ExportButton from "components/ProjectExport/ExportButton";
import ProjectAutocomplete from "components/ProjectSettings/ProjectAutocomplete";
import ProjectDefinitions from "components/ProjectSettings/ProjectDefinitions";
import ProjectImport from "components/ProjectSettings/ProjectImport";
import ProjectLanguages from "components/ProjectSettings/ProjectLanguages";
import ProjectName from "components/ProjectSettings/ProjectName";
import ProjectSwitch from "components/ProjectSettings/ProjectSwitch";
import ActiveUsers from "components/ProjectSettings/ProjectUsers/ActiveUsers";
import AddProjectUsers from "components/ProjectSettings/ProjectUsers/AddProjectUsers";
import ProjectButtonWithConfirmation from "components/SiteSettings/ProjectManagement/ProjectButtonWithConfirmation";
import { StoreState } from "types";

export default function ProjectSettingsComponent() {
  const projectId = useSelector(
    (state: StoreState) => state.currentProjectState.project.id
  );
  const currentRoles = useMemo(() => getCurrentUser()?.projectRoles ?? {}, []);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [imports, setImports] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const roleId = currentRoles[projectId];
    if (roleId) {
      backend
        .getUserRole(roleId)
        .then((role) => setPermissions(role.permissions));
    }
  }, [currentRoles, projectId]);

  useEffect(() => {
    if (permissions.includes(Permission.ImportExport)) {
      backend.canUploadLift().then(setImports);
    }
  }, [permissions, setImports]);

  useEffect(() => {
    if (permissions.includes(Permission.DeleteEditSettingsAndUsers)) {
      dispatch(asyncRefreshCurrentProjectUsers());
    }
  }, [permissions, dispatch]);

  function archiveUpdate() {
    toast(<Translate id="projectSettings.user.archiveToastSuccess" />);
    setTimeout(() => {
      history.push(Path.ProjScreen);
    }, 2000);
  }

  return (
    <Grid container justifyContent="center" spacing={6}>
      {/* Project List */}
      <BaseSettingsComponent
        icon={<List />}
        title={<Translate id="projectSettings.projectList" />}
        body={<ProjectSwitch />}
      />

      {/* Project name */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<Edit />}
          title={<Translate id="projectSettings.name" />}
          body={<ProjectName />}
        />
      )}

      {/*Project Vernacular and Analysis Languages*/}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<Language />}
          title={<Translate id="projectSettings.language.interfaceLanguage" />}
          body={<ProjectLanguages />}
        />
      )}

      {/* Import Lift file */}
      {permissions.includes(Permission.ImportExport) && (
        <BaseSettingsComponent
          icon={<CloudUpload />}
          title={<Translate id="projectSettings.import.header" />}
          body={
            imports ? (
              <ProjectImport />
            ) : (
              <Typography variant="body2">
                <Translate id="projectSettings.import.notAllowed" />
              </Typography>
            )
          }
        />
      )}

      {/* Export Lift file */}
      {permissions.includes(Permission.ImportExport) && (
        <BaseSettingsComponent
          icon={<GetApp />}
          title={<Translate id="projectSettings.exportProject.label" />}
          body={<ExportButton projectId={projectId} />}
        />
      )}

      {/* Autocomplete toggle */}
      <BaseSettingsComponent
        icon={<Sms />}
        title={<Translate id="projectSettings.autocomplete.label" />}
        body={<ProjectAutocomplete />}
      />

      {/* Definitions toggle */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<Assignment />}
          title={<Translate id="projectSettings.definitions.label" />}
          body={<ProjectDefinitions />}
        />
      )}

      {/* See current users in project */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<People />}
          title={<Translate id="projectSettings.user.currentUsers" />}
          body={<ActiveUsers />}
        />
      )}

      {/* Add users to project */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<PersonAdd />}
          title={<Translate id="projectSettings.user.addUser" />}
          body={<AddProjectUsers />}
        />
      )}

      {/* Archive project */}
      {permissions.includes(Permission.Owner) && (
        <BaseSettingsComponent
          icon={<Archive />}
          title={<Translate id="projectSettings.user.archive" />}
          body={
            <ProjectButtonWithConfirmation
              archive // Project Settings are only available for active projects
              projectId={projectId}
              updateParent={archiveUpdate}
              warn
            />
          }
        />
      )}
    </Grid>
  );
}
