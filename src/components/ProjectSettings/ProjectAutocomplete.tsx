import { HelpOutline } from "@mui/icons-material";
import { Grid, MenuItem, Select, Tooltip } from "@mui/material";
import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { OffOnSetting } from "api/models";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectAutocomplete(
  props: ProjectSettingProps
): ReactElement {
  const { t } = useTranslation();

  const updateAutocompleteSetting = async (
    autocompleteSetting: OffOnSetting
  ): Promise<void> => {
    await props.setProject({ ...props.project, autocompleteSetting });
  };

  return (
    <Grid container>
      <Grid>
        <Select
          variant="standard"
          value={props.project.autocompleteSetting}
          onChange={(e) =>
            updateAutocompleteSetting(e.target.value as OffOnSetting)
          }
        >
          <MenuItem value={OffOnSetting.Off}>
            {t("projectSettings.autocomplete.off")}
          </MenuItem>
          <MenuItem value={OffOnSetting.On}>
            {t("projectSettings.autocomplete.on")}
          </MenuItem>
        </Select>
      </Grid>
      <Grid>
        <Tooltip
          title={t("projectSettings.autocomplete.hint")}
          placement={document.body.dir === "rtl" ? "left" : "right"}
        >
          <HelpOutline fontSize="small" />
        </Tooltip>
      </Grid>
    </Grid>
  );
}
