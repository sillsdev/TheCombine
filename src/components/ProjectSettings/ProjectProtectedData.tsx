import { HelpOutline } from "@mui/icons-material";
import { MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { OffOnSetting } from "api/models";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectProtectedOverride({
  project,
  setProject,
}: ProjectSettingProps): ReactElement {
  const { t } = useTranslation();

  const updateProtectMergeAvoidSetting = async (
    protectedDataMergeAvoidEnabled: OffOnSetting
  ): Promise<void> => {
    await setProject({ ...project, protectedDataMergeAvoidEnabled });
  };

  const updateProtectOverrideSetting = async (
    protectedDataOverrideEnabled: OffOnSetting
  ): Promise<void> => {
    await setProject({ ...project, protectedDataOverrideEnabled });
  };

  return (
    <Stack spacing={3}>
      <div>
        <Stack direction="row" spacing={1}>
          <Typography>
            {t("projectSettings.protectedData.avoidInMerge.label")}
          </Typography>

          <Tooltip
            title={t("projectSettings.protectedData.avoidInMerge.hint")}
            placement={document.body.dir === "rtl" ? "left" : "right"}
          >
            <HelpOutline fontSize="small" />
          </Tooltip>
        </Stack>

        <Select
          variant="standard"
          value={project.protectedDataMergeAvoidEnabled}
          onChange={(e) =>
            updateProtectMergeAvoidSetting(e.target.value as OffOnSetting)
          }
        >
          <MenuItem value={OffOnSetting.Off}>
            {t("projectSettings.autocomplete.off")}
          </MenuItem>
          <MenuItem value={OffOnSetting.On}>
            {t("projectSettings.autocomplete.on")}
          </MenuItem>
        </Select>
      </div>

      <div>
        <Stack direction="row" spacing={1}>
          <Typography>
            {t("projectSettings.protectedData.override.label")}
          </Typography>

          <Tooltip
            title={t("projectSettings.protectedData.override.hint")}
            placement={document.body.dir === "rtl" ? "left" : "right"}
          >
            <HelpOutline fontSize="small" />
          </Tooltip>
        </Stack>

        <Select
          variant="standard"
          value={project.protectedDataOverrideEnabled}
          onChange={(e) =>
            updateProtectOverrideSetting(e.target.value as OffOnSetting)
          }
        >
          <MenuItem value={OffOnSetting.Off}>
            {t("projectSettings.autocomplete.off")}
          </MenuItem>
          <MenuItem value={OffOnSetting.On}>
            {t("projectSettings.autocomplete.on")}
          </MenuItem>
        </Select>
      </div>
    </Stack>
  );
}
