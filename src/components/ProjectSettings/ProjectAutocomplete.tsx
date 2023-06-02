import { HelpOutline } from "@mui/icons-material";
import { Grid, MenuItem, Select, Tooltip } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { AutocompleteSetting } from "api/models";
import { ProjectSettingPropsWithUpdate } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectAutocomplete(
  props: ProjectSettingPropsWithUpdate
): ReactElement {
  const { t } = useTranslation();

  const updateAutocompleteSetting = async (
    autocompleteSetting: AutocompleteSetting
  ): Promise<void> => {
    props.updateProject({ ...props.project, autocompleteSetting });
  };

  return (
    <Grid container>
      <Grid>
        <Select
          variant="standard"
          value={props.project.autocompleteSetting}
          onChange={(e) =>
            updateAutocompleteSetting(e.target.value as AutocompleteSetting)
          }
        >
          <MenuItem value={AutocompleteSetting.Off}>
            {t("projectSettings.autocomplete.off")}
          </MenuItem>
          <MenuItem value={AutocompleteSetting.On}>
            {t("projectSettings.autocomplete.on")}
          </MenuItem>
        </Select>
      </Grid>
      <Grid>
        <Tooltip
          title={t("projectSettings.autocomplete.hint")}
          placement="right"
        >
          <HelpOutline />
        </Tooltip>
      </Grid>
    </Grid>
  );
}
