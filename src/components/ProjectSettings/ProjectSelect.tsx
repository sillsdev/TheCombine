import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";

import { type Project } from "api/models";
import { getAllActiveProjects } from "backend";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectSelect(
  props: ProjectSettingProps
): ReactElement {
  const [projList, setProjList] = useState<Project[]>([]);

  useEffect(() => {
    getAllActiveProjects().then(setProjList);
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
  const hasProj = projList.some((p) => p.name === props.project.name);
  const projectList = hasProj ? [...projList] : [...projList, props.project];
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
