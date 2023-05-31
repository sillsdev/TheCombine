import { List, ListItemButton, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import { Project } from "api/models";
import { getAllActiveProjectsByUser } from "backend";
import { getUserId } from "backend/localStorage";
import { randomIntString } from "utilities/utilities";

interface SwitchProps {
  project: Project;
  setProject: (project: Project) => void;
}

export default function ProjectSwitch(props: SwitchProps): ReactElement {
  const [projList, setProjList] = useState<Project[]>([]);

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      getAllActiveProjectsByUser(userId).then(setProjList);
    }
  }, [props.project.name, setProjList]);

  const getListItems = (): ReactElement[] => {
    return projList.map((proj) => (
      <ListItemButton
        key={proj.id + randomIntString()}
        onClick={() => props.setProject(proj)}
      >
        <Typography
          variant="h6"
          color={proj.id !== props.project.id ? "textSecondary" : "inherit"}
        >
          {proj.name}
        </Typography>
      </ListItemButton>
    ));
  };

  return <List>{getListItems()}</List>;
}
