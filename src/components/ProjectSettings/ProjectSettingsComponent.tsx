import {
  Archive,
  CalendarMonth,
  CloudUpload,
  Edit,
  GetApp,
  Language,
  List,
  Mic,
  People,
  PersonAdd,
  Sms,
} from "@mui/icons-material";
import { Grid, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Permission } from "api/models";
import * as backend from "backend";
import { getCurrentUser } from "backend/localStorage";
import history, { Path } from "browserHistory";
import BaseSettingsComponent from "components/BaseSettings/BaseSettingsComponent";
import { asyncRefreshCurrentProjectUsers } from "components/Project/ProjectActions";
import ExportButton from "components/ProjectExport/ExportButton";
import ProjectAutocomplete from "components/ProjectSettings/ProjectAutocomplete";
import ProjectImport from "components/ProjectSettings/ProjectImport";
import ProjectLanguages from "components/ProjectSettings/ProjectLanguages";
import ProjectName from "components/ProjectSettings/ProjectName";
import ProjectRecording from "components/ProjectSettings/ProjectRecording";
import ProjectSchedule from "components/ProjectSettings/ProjectSchedule/ProjectSchedule";
import ProjectSwitch from "components/ProjectSettings/ProjectSwitch";
import ActiveUsers from "components/ProjectSettings/ProjectUsers/ActiveUsers";
import AddProjectUsers from "components/ProjectSettings/ProjectUsers/AddProjectUsers";
import ProjectButtonWithConfirmation from "components/SiteSettings/ProjectManagement/ProjectButtonWithConfirmation";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

export default function ProjectSettingsComponent() {
  const projectId = useAppSelector(
    (state: StoreState) => state.currentProjectState.project.id
  );
  const currentRoles = useMemo(() => getCurrentUser()?.projectRoles ?? {}, []);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [imports, setImports] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

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
    toast.success(t("projectSettings.user.archiveToastSuccess"));
    setTimeout(() => {
      history.push(Path.ProjScreen);
    }, 2000);
  }

  return (
    <Grid container justifyContent="center" spacing={6}>
      {/* Project List */}
      <BaseSettingsComponent
        icon={<List />}
        title={t("projectSettings.projectList")}
        body={<ProjectSwitch />}
      />

      {/* Project name */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<Edit />}
          title={t("projectSettings.name")}
          body={<ProjectName />}
        />
      )}

      {/*Project Vernacular and Analysis Languages*/}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<Language />}
          title={t("projectSettings.language.languages")}
          body={<ProjectLanguages />}
        />
      )}

      {/* Import Lift file */}
      {permissions.includes(Permission.ImportExport) && (
        <BaseSettingsComponent
          icon={<CloudUpload />}
          title={t("projectSettings.import.header")}
          body={
            imports ? (
              <ProjectImport />
            ) : (
              <Typography variant="body2">
                {t("projectSettings.import.notAllowed")}
              </Typography>
            )
          }
        />
      )}

      {/* Export Lift file */}
      {permissions.includes(Permission.ImportExport) && (
        <BaseSettingsComponent
          icon={<GetApp />}
          title={t("projectSettings.exportProject.label")}
          body={<ExportButton projectId={projectId} />}
        />
      )}

      {/* Autocomplete toggle */}
      <BaseSettingsComponent
        icon={<Sms />}
        title={t("projectSettings.autocomplete.label")}
        body={<ProjectAutocomplete />}
      />

      {/* Audio recording toggle */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<Mic />}
          title={t("projectSettings.recording.label")}
          body={
            <ProjectRecording
              isOwner={permissions.includes(Permission.Owner)}
            />
          }
        />
      )}

      {/* See current users in project */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<People />}
          title={t("projectSettings.user.currentUsers")}
          body={<ActiveUsers />}
        />
      )}

      {/* Add users to project */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<PersonAdd />}
          title={t("projectSettings.user.addUser")}
          body={<AddProjectUsers />}
        />
      )}

      {/* Set a workshop schedule */}
      {permissions.includes(Permission.Owner) && (
        <BaseSettingsComponent
          icon={<CalendarMonth />}
          title={t("projectSettings.schedule.workshopSchedule")}
          body={<ProjectSchedule projectId={projectId} />}
        />
      )}

      {/* Archive project */}
      {permissions.includes(Permission.Owner) && (
        <BaseSettingsComponent
          icon={<Archive />}
          title={t("projectSettings.user.archive")}
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
