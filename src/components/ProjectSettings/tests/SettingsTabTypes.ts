import {
  Archive,
  CalendarMonth,
  CloudUpload,
  Edit,
  GetApp,
  Language,
  People,
  PersonAdd,
  Sms,
} from "@mui/icons-material";
import { ElementType } from "react";

import { Permission } from "api/models";
import { ProjectSettingsTab } from "components/ProjectSettings";

export enum Setting {
  Archive,
  Autocomplete,
  Export,
  Import,
  Languages,
  Name,
  Schedule,
  UserAdd,
  Users,
}

const iconBySetting: Record<Setting, ElementType> = {
  [Setting.Archive]: Archive,
  [Setting.Autocomplete]: Sms,
  [Setting.Export]: GetApp,
  [Setting.Import]: CloudUpload,
  [Setting.Languages]: Language,
  [Setting.Name]: Edit,
  [Setting.Schedule]: CalendarMonth,
  [Setting.UserAdd]: PersonAdd,
  [Setting.Users]: People,
};

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

const settingsWithReadOnly = [Setting.Languages, Setting.Schedule];

export const whichSettings = (
  tab: ProjectSettingsTab,
  perm: Permission,
  readOnly = false
): Setting[] => {
  const forAll = readOnly ? settingsWithReadOnly : [];
  const settings = [...forAll, ...settingsByPermission[perm]];
  return settingsByTab[tab].filter((s) => settings.includes(s));
};
