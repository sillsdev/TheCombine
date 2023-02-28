import { HelpOutline } from "@mui/icons-material";
import {
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { AutocompleteSetting } from "api/models";
import { saveChangesToProject } from "components/Project/ProjectActions";
import { StoreState } from "types";

export default function ProjectAutocomplete() {
  const project = useSelector(
    (state: StoreState) => state.currentProjectState.project
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <Grid container>
      <Grid>
        <Select
          variant="standard"
          value={project.autocompleteSetting}
          onChange={(event: SelectChangeEvent<AutocompleteSetting>) =>
            saveChangesToProject(
              {
                ...project,
                autocompleteSetting: event.target.value as AutocompleteSetting,
              },
              dispatch
            )
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
