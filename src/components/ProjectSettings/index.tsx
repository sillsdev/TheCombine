import {
  Archive,
  CalendarMonth,
  CloudUpload,
  Edit,
  GetApp,
  Language,
  List,
  People,
  PersonAdd,
  Sms,
} from "@mui/icons-material";
import { Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Permission, Project } from "api/models";
import { canUploadLift, getCurrentPermissions } from "backend";
import BaseSettingsComponent from "components/BaseSettings/BaseSettingsComponent";
import {
  asyncRefreshProjectUsers,
  asyncUpdateCurrentProject,
  setNewCurrentProject,
} from "components/Project/ProjectActions";
import ExportButton from "components/ProjectExport/ExportButton";
import ProjectAutocomplete from "components/ProjectSettings/ProjectAutocomplete";
import ProjectImport from "components/ProjectSettings/ProjectImport";
import ProjectLanguages from "components/ProjectSettings/ProjectLanguages";
import ProjectName from "components/ProjectSettings/ProjectName";
import ProjectSchedule from "components/ProjectSettings/ProjectSchedule/ProjectSchedule";
import ProjectSwitch from "components/ProjectSettings/ProjectSwitch";
import ActiveProjectUsers from "components/ProjectSettings/ProjectUsers/ActiveProjectUsers";
import AddProjectUsers from "components/ProjectSettings/ProjectUsers/AddProjectUsers";
import ProjectButtonWithConfirmation from "components/SiteSettings/ProjectManagement/ProjectButtonWithConfirmation";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { Path } from "types/path";

export default function ProjectSettingsComponent() {
  const project = useAppSelector(
    (state: StoreState) => state.currentProjectState.project
  );
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [imports, setImports] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentPermissions().then(setPermissions);
  }, [project.id]);

  useEffect(() => {
    if (permissions.includes(Permission.Import)) {
      canUploadLift().then(setImports);
    }
    if (permissions.includes(Permission.DeleteEditSettingsAndUsers)) {
      dispatch(asyncRefreshProjectUsers(project.id));
    }
  }, [dispatch, permissions, project.id]);

  const archiveUpdate = (): void => {
    toast.success(t("projectSettings.archive.archiveToastSuccess"));
    setTimeout(() => {
      navigate(Path.ProjScreen);
    }, 2000);
  };

  const setProject = useCallback(
    (proj: Project) => dispatch(setNewCurrentProject(proj)),
    [dispatch]
  );

  const updateProject = useCallback(
    async (proj: Project) => await dispatch(asyncUpdateCurrentProject(proj)),
    [dispatch]
  );

  return (
    <Grid container justifyContent="center" spacing={6}>
      {/* Project List */}
      <BaseSettingsComponent
        icon={<List />}
        title={t("projectSettings.projectList")}
        body={<ProjectSwitch project={project} setProject={setProject} />}
      />

      {/* Project name */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<Edit />}
          title={t("projectSettings.name")}
          body={<ProjectName project={project} updateProject={updateProject} />}
        />
      )}

      {/*Project languages*/}
      <BaseSettingsComponent
        icon={<Language />}
        title={t("projectSettings.language.languages")}
        body={
          <ProjectLanguages
            project={project}
            readOnly={
              !permissions.includes(Permission.DeleteEditSettingsAndUsers)
            }
            updateProject={updateProject}
          />
        }
      />

      {/* Import Lift file */}
      {permissions.includes(Permission.Import) && (
        <BaseSettingsComponent
          icon={<CloudUpload />}
          title={t("projectSettings.import.header")}
          body={
            imports ? (
              <ProjectImport project={project} setProject={setProject} />
            ) : (
              <Typography variant="body2">
                {t("projectSettings.import.notAllowed")}
              </Typography>
            )
          }
        />
      )}

      {/* Export Lift file */}
      {permissions.includes(Permission.Export) && (
        <BaseSettingsComponent
          icon={<GetApp />}
          title={t("projectSettings.exportProject.label")}
          body={<ExportButton projectId={project.id} />}
        />
      )}

      {/* Autocomplete toggle */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<Sms />}
          title={t("projectSettings.autocomplete.label")}
          body={
            <ProjectAutocomplete
              project={project}
              updateProject={updateProject}
            />
          }
        />
      )}

      {/* See current users in project */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<People />}
          title={t("projectSettings.user.currentUsers")}
          body={<ActiveProjectUsers projectId={project.id} />}
        />
      )}

      {/* Add users to project */}
      {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
        <BaseSettingsComponent
          icon={<PersonAdd />}
          title={t("projectSettings.user.addUser")}
          body={<AddProjectUsers projectId={project.id} />}
        />
      )}

      {/* Workshop schedule */}
      <BaseSettingsComponent
        icon={<CalendarMonth />}
        title={t("projectSettings.schedule.workshopSchedule")}
        body={
          <ProjectSchedule
            project={project}
            readOnly={!permissions.includes(Permission.Statistics)}
            updateProject={updateProject}
          />
        }
      />

      {/* Archive project */}
      {permissions.includes(Permission.Archive) && (
        <BaseSettingsComponent
          icon={<Archive />}
          title={t("projectSettings.archive.archive")}
          body={
            <ProjectButtonWithConfirmation
              archive // Project Settings are only available for active projects
              projectId={project.id}
              updateParent={archiveUpdate}
              warn
            />
          }
        />
      )}
    </Grid>
  );
}
