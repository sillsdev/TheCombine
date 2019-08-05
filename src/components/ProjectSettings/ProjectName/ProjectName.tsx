import React from "react";
import { TextField } from "@material-ui/core";

import { updateProject } from "../../../backend";
import { Project } from "../../../types/project";

interface NameProps {
  project: Project;
}

function ProjectName(props: NameProps) {
  const [projectName, setProjectName] = React.useState<string>(
    props.project.name
  );

  function updateName() {
    updateProject({
      ...props.project,
      name: projectName
    });
  }

  return (
    <TextField
      value={projectName}
      onChange={e => setProjectName(e.target.value)}
      onBlur={() => updateName()}
    />
  );
}

export default ProjectName;
