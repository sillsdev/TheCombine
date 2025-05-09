import { HelpOutline } from "@mui/icons-material";
import { MenuItem, Select, Stack, Tooltip } from "@mui/material";
import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { OffOnSetting } from "api/models";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectProtectedOverride(
  props: ProjectSettingProps
): ReactElement {
  const { t } = useTranslation();

  const updateProtectOverrideSetting = async (
    protectedDataOverrideEnabled: OffOnSetting
  ): Promise<void> => {
    await props.setProject({ ...props.project, protectedDataOverrideEnabled });
  };

  return (
    <Stack direction="row">
      <Select
        variant="standard"
        value={props.project.protectedDataOverrideEnabled}
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

      <Tooltip
        title={t("projectSettings.protectedDataOverride.hint")}
        placement={document.body.dir === "rtl" ? "left" : "right"}
      >
        <HelpOutline fontSize="small" />
      </Tooltip>
    </Stack>
  );
}
