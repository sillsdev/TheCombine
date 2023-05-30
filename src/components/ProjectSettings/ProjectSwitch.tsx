import { List, ListItemButton, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import { Project } from "api/models";
import { getAllActiveProjectsByUser } from "backend";
import { getUserId } from "backend/localStorage";
import { setNewCurrentProject } from "components/Project/ProjectActions";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { randomIntString } from "utilities/utilities";

export default () => {
  const dispatch = useAppDispatch();
  const project = useAppSelector(
    (state: StoreState) => state.currentProjectState.project
  );
  const setProject = async (proj: Project) => {
    dispatch(setNewCurrentProject(proj));
  };
  return <ProjectSwitch project={project} setProject={setProject} />;
};

interface SwitchProps {
  project: Project;
  setProject: (project: Project) => void;
}

export function ProjectSwitch(props: SwitchProps): ReactElement {
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
