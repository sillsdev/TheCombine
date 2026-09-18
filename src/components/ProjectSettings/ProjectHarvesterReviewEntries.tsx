import { HelpOutline } from "@mui/icons-material";
import { MenuItem, Select, Stack, Tooltip } from "@mui/material";
import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { OffOnSetting } from "api/models";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectHarvesterReviewEntries(
  props: ProjectSettingProps
): ReactElement {
  const { t } = useTranslation();

  const updateSetting = async (
    harvesterReviewEntriesEnabled: OffOnSetting
  ): Promise<void> => {
    await props.setProject({ ...props.project, harvesterReviewEntriesEnabled });
  };

  return (
    <Stack direction="row">
      <Select
        onChange={(e) => updateSetting(e.target.value as OffOnSetting)}
        value={props.project.harvesterReviewEntriesEnabled}
        variant="standard"
      >
        <MenuItem value={OffOnSetting.Off}>
          {t("projectSettings.autocomplete.off")}
        </MenuItem>
        <MenuItem value={OffOnSetting.On}>
          {t("projectSettings.autocomplete.on")}
        </MenuItem>
      </Select>

      <Tooltip
        title={t("projectSettings.harvesterReviewEntries.hint")}
        placement={document.body.dir === "rtl" ? "left" : "right"}
      >
        <HelpOutline fontSize="small" />
      </Tooltip>
    </Stack>
  );
}
