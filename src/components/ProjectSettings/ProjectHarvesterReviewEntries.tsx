import { HelpOutline } from "@mui/icons-material";
import { MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { OffOnSetting } from "api/models";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectHarvesterReviewEntries({
  project,
  setProject,
}: ProjectSettingProps): ReactElement {
  const { t } = useTranslation();

  const updateSetting = async (
    harvesterReviewEntriesEnabled: OffOnSetting
  ): Promise<void> => {
    await setProject({ ...project, harvesterReviewEntriesEnabled });
  };

  return (
    <div>
      <Stack direction="row" spacing={1}>
        <Typography>
          {t("projectSettings.harvesterReviewEntries.label")}
        </Typography>
        <Tooltip
          title={t("projectSettings.harvesterReviewEntries.hint")}
          placement={document.body.dir === "rtl" ? "left" : "right"}
        >
          <HelpOutline fontSize="small" />
        </Tooltip>
      </Stack>
      <Select
        variant="standard"
        value={project.harvesterReviewEntriesEnabled}
        onChange={(e) => updateSetting(e.target.value as OffOnSetting)}
      >
        <MenuItem value={OffOnSetting.Off}>
          {t("projectSettings.autocomplete.off")}
        </MenuItem>
        <MenuItem value={OffOnSetting.On}>
          {t("projectSettings.autocomplete.on")}
        </MenuItem>
      </Select>
    </div>
  );
}
