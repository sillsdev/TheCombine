import { HelpOutline } from "@mui/icons-material";
import { Grid, MenuItem, Select, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

import { AutocompleteSetting } from "api/models";
import { asyncUpdateCurrentProject } from "components/Project/ProjectActions";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

export default function ProjectAutocomplete() {
  const project = useAppSelector(
    (state: StoreState) => state.currentProjectState.project
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const updateAutocompleteSetting = async (
    autocompleteSetting: AutocompleteSetting
  ): Promise<void> => {
    dispatch(asyncUpdateCurrentProject({ ...project, autocompleteSetting }));
  };

  return (
    <Grid container>
      <Grid>
        <Select
          variant="standard"
          value={project.autocompleteSetting}
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
