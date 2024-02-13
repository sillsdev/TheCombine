import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import { Project } from "api/models";
import { getAllActiveProjectsByUser } from "backend";
import { getUserId } from "backend/localStorage";
import { ProjectSettingPropsWithSet } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectSelect(
  props: ProjectSettingPropsWithSet
): ReactElement {
  const [projList, setProjList] = useState<Project[]>([]);

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      getAllActiveProjectsByUser(userId).then(setProjList);
    }
  }, [props.project.name]);

  const handleChange = (e: SelectChangeEvent): void => {
    if (e.target.name === props.project.name) {
      return;
    }
    const proj = projList.find((p) => p.name === e.target.value);
    if (proj) {
      props.setProject(proj);
    }
  };

  // This prevents an out-of-range Select error while useEffect is underway.
  const projectList = [...projList];
  if (projectList.every((p) => p.name !== props.project.name)) {
    projectList.push(props.project);
  }
  projectList.sort((a: Project, b: Project) => a.name.localeCompare(b.name));

  return (
    <Select
      onChange={handleChange}
      sx={{ maxWidth: "100%" }}
      value={props.project.name}
    >
      {projectList.map((p) => (
        <MenuItem key={p.id} value={p.name}>
          {p.name}
        </MenuItem>
      ))}
    </Select>
  );
}
