import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import { Project } from "api/models";
import { getAllActiveProjectsByUser } from "backend";
import { getUserId } from "backend/localStorage";
import { ProjectSettingPropsWithSet } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectSelect(
  props: ProjectSettingPropsWithSet
): ReactElement {
  const [projList, setProjList] = useState<Project[]>([props.project]);

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      getAllActiveProjectsByUser(userId).then(setProjList);
    }
  }, [props.project.name]);

  const handleChange = (e: SelectChangeEvent) => {
    const proj = projList.find((p) => p.name === e.target.value);
    if (proj) {
      props.setProject(proj);
    }
  };

  return (
    <Select
      onChange={handleChange}
      sx={{ maxWidth: "100%" }}
      value={props.project.name}
    >
      {projList.map((p, i) => (
        <MenuItem key={i} value={p.name}>
          {p.name}
        </MenuItem>
      ))}
    </Select>
  );
}
