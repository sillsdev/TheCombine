import { FormControl, MenuItem, Select } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import { AutocompleteSetting } from "api/models";
import { saveChangesToProject } from "components/Project/ProjectActions";
import { StoreState } from "types";

export default function ProjectAutocomplete() {
  const project = useSelector((state: StoreState) => state.currentProject);
  const dispatch = useDispatch();
  return (
    <FormControl>
      <Select
        value={project.autocompleteSetting}
        onChange={(event: React.ChangeEvent<{ value: unknown }>) =>
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
          <Translate id="projectSettings.autocomplete.off" />
        </MenuItem>
        <MenuItem value={AutocompleteSetting.On}>
          <Translate id="projectSettings.autocomplete.on" />
        </MenuItem>
      </Select>
    </FormControl>
  );
}
