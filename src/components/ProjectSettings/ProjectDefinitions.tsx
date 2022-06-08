import { Grid, MenuItem, Select, Tooltip } from "@material-ui/core";
import { HelpOutline } from "@material-ui/icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { saveChangesToProject } from "components/Project/ProjectActions";
import { StoreState } from "types";

export default function ProjectDefinitions() {
  const project = useSelector(
    (state: StoreState) => state.currentProjectState.project
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <Grid container>
      <Grid>
        <Select
          value={project.definitionsEnabled ? 1 : 0}
          onChange={(event: React.ChangeEvent<{ value: unknown }>) =>
            saveChangesToProject(
              {
                ...project,
                definitionsEnabled: !!event.target.value,
              },
              dispatch
            )
          }
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
