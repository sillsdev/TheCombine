import { Permission } from "api/models";
import { ProjectSettingsTab, Setting } from "components/ProjectSettings";

const settingsByTab: Record<ProjectSettingsTab, Setting[]> = {
  [ProjectSettingsTab.Basic]: [
    Setting.Archive,
    Setting.Autocomplete,
    Setting.Name,
  ],
  [ProjectSettingsTab.ImportExport]: [Setting.Export, Setting.Import],
  [ProjectSettingsTab.Languages]: [Setting.Languages],
  [ProjectSettingsTab.Schedule]: [Setting.Schedule],
  [ProjectSettingsTab.Users]: [Setting.UserAdd, Setting.Users],
};

const settingsByPermission: Record<Permission, Setting[]> = {
  [Permission.Archive]: [Setting.Archive],
  [Permission.CharacterInventory]: [],
  [Permission.DeleteEditSettingsAndUsers]: [
    Setting.Autocomplete,
    Setting.Languages,
    Setting.Name,
    Setting.UserAdd,
    Setting.Users,
  ],
  [Permission.Export]: [Setting.Export],
  [Permission.Import]: [Setting.Import],
  [Permission.MergeAndReviewEntries]: [],
  [Permission.Statistics]: [Setting.Schedule],
  [Permission.WordEntry]: [],
};

function readOnlySettings(hasSchedule: boolean): Setting[] {
  return hasSchedule
    ? [Setting.Languages, Setting.Schedule]
    : [Setting.Languages];
}

export function whichSettings(
  perm: Permission,
  hasSchedule = false,
  tab?: ProjectSettingsTab
): Setting[] {
  const settings = [
    ...readOnlySettings(hasSchedule),
    ...settingsByPermission[perm],
  ];
  if (!tab) {
    return settings;
  }
  return settingsByTab[tab].filter((s) => settings.includes(s));
}

function tabHasSomeSetting(
  tab: ProjectSettingsTab,
  settings: Setting[]
): boolean {
  return settingsByTab[tab].findIndex((s) => settings.includes(s)) !== -1;
}

export function whichTabs(
  perm: Permission,
  hasSchedule = false
): ProjectSettingsTab[] {
  const settings = whichSettings(perm, hasSchedule);
  return Object.values(ProjectSettingsTab).filter((t) =>
    tabHasSomeSetting(t, settings)
  );
}
