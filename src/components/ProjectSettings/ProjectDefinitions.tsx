import { HelpOutline } from "@mui/icons-material";
import { Grid, MenuItem, Select, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

import { asyncUpdateCurrentProject } from "components/Project/ProjectActions";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

export default function ProjectDefinitions() {
  const project = useAppSelector(
    (state: StoreState) => state.currentProjectState.project
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const updateDefinitionsEnabled = async (
    definitionsEnabled: boolean
  ): Promise<void> => {
    dispatch(asyncUpdateCurrentProject({ ...project, definitionsEnabled }));
  };

  return (
    <Grid container>
      <Grid>
        <Select
          variant="standard"
          value={project.definitionsEnabled ? 1 : 0}
          onChange={(e) => updateDefinitionsEnabled(!!e.target.value)}
        >
          <MenuItem value={0}>{t("projectSettings.autocomplete.off")}</MenuItem>
          <MenuItem value={1}>{t("projectSettings.autocomplete.on")}</MenuItem>
        </Select>
      </Grid>
      <Grid>
        <Tooltip
          title={t("projectSettings.definitions.hint")}
          placement="right"
        >
          <HelpOutline />
        </Tooltip>
      </Grid>
    </Grid>
  );
}
