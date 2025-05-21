import {
  AccountTree,
  Archive,
  CalendarMonth,
  CloudUpload,
  Edit,
  GetApp,
  ImportExport,
  Language,
  People,
  PersonAdd,
  RecordVoiceOver,
  RemoveModerator,
  Settings,
  Sms,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Stack,
  Tab,
  Tabs,
  type Theme,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { Permission, type Project } from "api/models";
import { canUploadLift, getCurrentPermissions } from "backend";
import {
  asyncRefreshProjectUsers,
  asyncSetNewCurrentProject,
  asyncUpdateCurrentProject,
} from "components/Project/ProjectActions";
import ExportButton from "components/ProjectExport/ExportButton";
import BaseSettings from "components/ProjectSettings/BaseSettings";
import ProjectArchive from "components/ProjectSettings/ProjectArchive";
import ProjectAutocomplete from "components/ProjectSettings/ProjectAutocomplete";
import ProjectDomains from "components/ProjectSettings/ProjectDomains";
import ProjectImport from "components/ProjectSettings/ProjectImport";
import ProjectLanguages, {
  SemanticDomainLanguage,
} from "components/ProjectSettings/ProjectLanguages";
import ProjectName from "components/ProjectSettings/ProjectName";
import ProjectProtectedOverride from "components/ProjectSettings/ProjectProtectedOverride";
import ProjectSchedule from "components/ProjectSettings/ProjectSchedule";
import ProjectSelect from "components/ProjectSettings/ProjectSelect";
import ActiveProjectUsers from "components/ProjectUsers/ActiveProjectUsers";
import AddProjectUsers from "components/ProjectUsers/AddProjectUsers";
import ProjectSpeakersList from "components/ProjectUsers/ProjectSpeakersList";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { Path } from "types/path";

export enum ProjectSettingsTab {
  Basic = "TabBasic",
  Languages = "TabLanguages",
  Users = "TabUsers",
  ImportExport = "TabImportExport",
  Schedule = "TabSchedule",
  Domains = "TabDomains",
}

export enum Setting {
  Archive = "SettingArchive",
  Autocomplete = "SettingAutocomplete",
  DomainsCustom = "SettingDomainsCustom",
  DomainsLanguage = "SettingsDomainsLanguage",
  Export = "SettingExport",
  Import = "SettingImport",
  Languages = "SettingLanguages",
  Name = "SettingName",
  ProtectOverride = "SettingProtectOverride",
  Schedule = "SettingSchedule",
  Speakers = "SettingSpeakers",
  UserAdd = "SettingUserAdd",
  Users = "SettingUsers",
}

export default function ProjectSettingsComponent(): ReactElement {
  const dispatch = useAppDispatch();
  const project = useAppSelector(
    (state: StoreState) => state.currentProjectState.project
  );
  const hideLabels = useMediaQuery<Theme>((th) => th.breakpoints.down("md"));
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [imports, setImports] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [tab, setTab] = useState(ProjectSettingsTab.Languages);

  useEffect(() => {
    // Default to Languages tab as it's available for any permissions.
    setTab(ProjectSettingsTab.Languages);
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

  const setNewProject = useCallback(
    async (proj: Project) => await dispatch(asyncSetNewCurrentProject(proj)),
    [dispatch]
  );

  const updateProject = useCallback(
    async (proj: Project) => await dispatch(asyncUpdateCurrentProject(proj)),
    [dispatch]
  );

  return (
    <>
      {/* Project list */}
      <Typography display="inline" sx={{ p: 1 }}>
        {t("projectSettings.project")}
      </Typography>
      <ProjectSelect project={project} setProject={setNewProject} />

      <Divider sx={{ my: 1 }} />

      <SettingsTabs
        hasSchedule={!!project.workshopSchedule?.length}
        hideLabels={hideLabels}
        permissions={permissions}
        setTab={setTab}
        tab={tab}
      />

      <TabPanel value={tab} index={ProjectSettingsTab.Basic}>
        <Stack>
          {/* Project name */}
          {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
            <BaseSettings
              icon={<Edit data-testid={Setting.Name} />}
              title={t("projectSettings.name")}
              body={
                <ProjectName project={project} setProject={updateProject} />
              }
            />
          )}

          {/* Autocomplete toggle */}
          {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
            <BaseSettings
              icon={<Sms data-testid={Setting.Autocomplete} />}
              title={t("projectSettings.autocomplete.label")}
              body={
                <ProjectAutocomplete
                  project={project}
                  setProject={updateProject}
                />
              }
            />
          )}

          {/* Protected data override toggle */}
          {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
            <BaseSettings
              icon={<RemoveModerator data-testid={Setting.ProtectOverride} />}
              title={t("projectSettings.protectedDataOverride.label")}
              body={
                <ProjectProtectedOverride
                  project={project}
                  setProject={updateProject}
                />
              }
            />
          )}

          {/* Archive project */}
          {permissions.includes(Permission.Archive) && (
            <BaseSettings
              icon={<Archive data-testid={Setting.Archive} />}
              title={t("projectSettings.archive.archive")}
              body={
                <ProjectArchive
                  archive // Project Settings are only available for active projects
                  projectId={project.id}
                  updateParent={archiveUpdate}
                  warn
                />
              }
            />
          )}
        </Stack>
      </TabPanel>

      <TabPanel value={tab} index={ProjectSettingsTab.Languages}>
        <Stack>
          {/*Project languages*/}
          <BaseSettings
            icon={<Language data-testid={Setting.Languages} />}
            title={t("projectSettings.language.languages")}
            body={
              <ProjectLanguages
                project={project}
                readOnly={
                  !permissions.includes(Permission.DeleteEditSettingsAndUsers)
                }
                setProject={updateProject}
              />
            }
          />
        </Stack>
      </TabPanel>

      <TabPanel value={tab} index={ProjectSettingsTab.Users}>
        <Stack>
          {/* See current users in project */}
          {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
            <BaseSettings
              icon={<People data-testid={Setting.Users} />}
              title={t("projectSettings.user.currentUsers")}
              body={<ActiveProjectUsers projectId={project.id} />}
            />
          )}

          {/* Add users to project */}
          {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
            <BaseSettings
              icon={<PersonAdd data-testid={Setting.UserAdd} />}
              title={t("projectSettings.user.addUser")}
              body={<AddProjectUsers projectId={project.id} />}
            />
          )}

          {/* Manage project speakers */}
          {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
            <BaseSettings
              icon={<RecordVoiceOver data-testid={Setting.Speakers} />}
              title={t("projectSettings.speaker.label")}
              body={<ProjectSpeakersList projectId={project.id} />}
            />
          )}
        </Stack>
      </TabPanel>

      <TabPanel value={tab} index={ProjectSettingsTab.ImportExport}>
        <Stack>
          {/* Import Lift file */}
          {permissions.includes(Permission.Import) && (
            <BaseSettings
              icon={<CloudUpload data-testid={Setting.Import} />}
              title={t("projectSettings.import.header")}
              body={
                imports ? (
                  <ProjectImport project={project} setProject={setNewProject} />
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
            <BaseSettings
              icon={<GetApp data-testid={Setting.Export} />}
              title={t("projectSettings.exportProject.label")}
              body={<ExportButton projectId={project.id} />}
            />
          )}
        </Stack>
      </TabPanel>

      <TabPanel value={tab} index={ProjectSettingsTab.Schedule}>
        <Stack>
          {/* Workshop schedule */}
          <BaseSettings
            icon={<CalendarMonth data-testid={Setting.Schedule} />}
            title={t("projectSettings.schedule.workshopSchedule")}
            body={
              <ProjectSchedule
                project={project}
                readOnly={!permissions.includes(Permission.Statistics)}
                setProject={updateProject}
              />
            }
            maxWidth="1050px" // Comfortably fits three months
          />
        </Stack>
      </TabPanel>

      <TabPanel value={tab} index={ProjectSettingsTab.Domains}>
        <Stack>
          {/* Semantic domains language */}
          <BaseSettings
            icon={<Language data-testid={Setting.DomainsLanguage} />}
            title={t("projectSettings.domains.semDomLanguage")}
            body={
              <SemanticDomainLanguage
                project={project}
                setProject={updateProject}
              />
            }
          />

          {/* Custom semantic domains */}
          <BaseSettings
            icon={<AccountTree data-testid={Setting.DomainsCustom} />}
            title={t("projectSettings.domains.label")}
            body={
              <ProjectDomains project={project} setProject={updateProject} />
            }
          />
        </Stack>
      </TabPanel>
    </>
  );
}

interface SettingsTabsProps {
  hasSchedule: boolean;
  hideLabels?: boolean;
  permissions: Permission[];
  setTab: (tab: ProjectSettingsTab) => void;
  tab: ProjectSettingsTab;
}

function SettingsTabs(props: SettingsTabsProps): ReactElement {
  const { hideLabels, permissions, tab } = props;

  const handleChange = (_e: SyntheticEvent, val: ProjectSettingsTab): void =>
    props.setTab(val);

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs onChange={handleChange} value={tab}>
        {(permissions.includes(Permission.DeleteEditSettingsAndUsers) ||
          permissions.includes(Permission.Archive)) && (
          <Tab
            data-testid={ProjectSettingsTab.Basic}
            id={ProjectSettingsTab.Basic.toString()}
            label={
              <TabLabel
                hideLabel={hideLabels}
                icon={<Settings />}
                textId={"projectSettings.tab.basic"}
              />
            }
            sx={{ minWidth: 0 }}
            value={ProjectSettingsTab.Basic}
          />
        )}

        <Tab
          data-testid={ProjectSettingsTab.Languages}
          id={ProjectSettingsTab.Languages.toString()}
          label={
            <TabLabel
              hideLabel={hideLabels}
              icon={<Language />}
              textId={"projectSettings.tab.languages"}
            />
          }
          sx={{ minWidth: 0 }}
          value={ProjectSettingsTab.Languages}
        />

        {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
          <Tab
            data-testid={ProjectSettingsTab.Users}
            id={ProjectSettingsTab.Users.toString()}
            label={
              <TabLabel
                hideLabel={hideLabels}
                icon={<People />}
                textId={"projectSettings.tab.users"}
              />
            }
            sx={{ minWidth: 0 }}
            value={ProjectSettingsTab.Users}
          />
        )}

        {(permissions.includes(Permission.Export) ||
          permissions.includes(Permission.Import)) && (
          <Tab
            data-testid={ProjectSettingsTab.ImportExport}
            id={ProjectSettingsTab.ImportExport.toString()}
            label={
              permissions.includes(Permission.Import) ? (
                <TabLabel
                  hideLabel={hideLabels}
                  icon={<ImportExport />}
                  textId={"projectSettings.tab.importExport"}
                />
              ) : (
                <TabLabel
                  hideLabel={hideLabels}
                  icon={<GetApp />}
                  textId={"projectSettings.tab.export"}
                />
              )
            }
            sx={{ minWidth: 0 }}
            value={ProjectSettingsTab.ImportExport}
          />
        )}

        {(permissions.includes(Permission.Statistics) || props.hasSchedule) && (
          <Tab
            data-testid={ProjectSettingsTab.Schedule}
            id={ProjectSettingsTab.Schedule.toString()}
            label={
              <TabLabel
                hideLabel={hideLabels}
                icon={<CalendarMonth />}
                textId={"projectSettings.tab.schedule"}
              />
            }
            sx={{ minWidth: 0 }}
            value={ProjectSettingsTab.Schedule}
          />
        )}

        {permissions.includes(Permission.DeleteEditSettingsAndUsers) && (
          <Tab
            data-testid={ProjectSettingsTab.Domains}
            id={ProjectSettingsTab.Domains.toString()}
            label={
              <TabLabel
                hideLabel={hideLabels}
                icon={<AccountTree />}
                textId={"projectSettings.tab.domains"}
              />
            }
            sx={{ minWidth: 0 }}
            value={ProjectSettingsTab.Domains}
          />
        )}
      </Tabs>
    </Box>
  );
}

interface TabLabelProps {
  hideLabel?: boolean;
  icon: ReactElement;
  textId: string;
}

function TabLabel(props: TabLabelProps): ReactElement {
  const { t } = useTranslation();
  return props.hideLabel ? (
    <Tooltip title={t(props.textId)}>{props.icon}</Tooltip>
  ) : (
    <Stack direction="row">
      {props.icon}
      <Typography>{t(props.textId)}</Typography>
    </Stack>
  );
}

interface TabPanelProps {
  children?: ReactNode;
  index: ProjectSettingsTab;
  value: ProjectSettingsTab;
}

function TabPanel(props: TabPanelProps): ReactElement {
  const { children, index, value } = props;
  return (
    <div hidden={value !== index} id={`tab-panel-${index}`} role={"tabpanel"}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
