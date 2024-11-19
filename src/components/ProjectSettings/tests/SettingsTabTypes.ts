import { Permission } from "api/models";
import { ProjectSettingsTab, Setting } from "components/ProjectSettings";

/** A dictionary indexed by all the project settings tabs. For each key tab,
 * the associated value is a list of all settings to be found in that tab. */
const settingsByTab: Record<ProjectSettingsTab, Setting[]> = {
  [ProjectSettingsTab.Basic]: [
    Setting.Archive,
    Setting.Autocomplete,
    Setting.Name,
    Setting.ProtectOverride,
  ],
  [ProjectSettingsTab.ImportExport]: [Setting.Export, Setting.Import],
  [ProjectSettingsTab.Languages]: [Setting.Languages],
  [ProjectSettingsTab.Schedule]: [Setting.Schedule],
  [ProjectSettingsTab.Users]: [
    Setting.Speakers,
    Setting.UserAdd,
    Setting.Users,
  ],
  [ProjectSettingsTab.Domains]: [
    Setting.DomainsLanguage,
    Setting.DomainsCustom,
  ],
};

/** A dictionary indexed by all the project permissions. For each key permission,
 * the associated value is a list of settings editable by that permission. */
const settingsByPermission: Record<Permission, Setting[]> = {
  [Permission.Archive]: [Setting.Archive],
  [Permission.CharacterInventory]: [],
  [Permission.DeleteEditSettingsAndUsers]: [
    Setting.Autocomplete,
    Setting.DomainsLanguage,
    Setting.DomainsCustom,
    Setting.Languages,
    Setting.Name,
    Setting.ProtectOverride,
    Setting.Speakers,
    Setting.UserAdd,
    Setting.Users,
  ],
  [Permission.Export]: [Setting.Export],
  [Permission.Import]: [Setting.Import],
  [Permission.MergeAndReviewEntries]: [],
  [Permission.Statistics]: [Setting.Schedule],
  [Permission.WordEntry]: [],
};

/** Returns a list of settings for which there is a read-only version available to all
 * users. Whether or not `Setting.Schedule` is available depends on if a workshop
 * schedule has been set. */
function readOnlySettings(hasSchedule: boolean): Setting[] {
  return hasSchedule
    ? [Setting.Languages, Setting.Schedule]
    : [Setting.Languages];
}

/** Given a project permission `perm` and a boolean `hasSchedule` (indicating whether any
 * workshop dates have been set), returns a list of available settings.
 * If `tab` is specified, only returns the available settings that are also in that
 * project settings tab. */
export function whichSettings(
  perm: Permission,
  hasSchedule: boolean,
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

/** Returns whether any elements of given list `settings` is found in the given `tab`. */
function tabHasSomeSetting(
  tab: ProjectSettingsTab,
  settings: Setting[]
): boolean {
  return settingsByTab[tab].some((s) => settings.includes(s));
}

/** Given a project permission `perm` and a boolean `hasSchedule` (indicating whether any
 * workshop dates have been set), returns a list of tabs that should be visible. */
export function whichTabs(
  perm: Permission,
  hasSchedule = false
): ProjectSettingsTab[] {
  const settings = whichSettings(perm, hasSchedule);
  return Object.values(ProjectSettingsTab).filter((t) =>
    tabHasSomeSetting(t, settings)
  );
}
