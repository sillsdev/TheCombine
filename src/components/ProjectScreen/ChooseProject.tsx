import {
  Card,
  CardContent,
  List,
  ListItemButton,
  Typography,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Project } from "api/models";
import { getAllActiveProjectsByUser } from "backend";
import { getUserId } from "backend/localStorage";
import { setNewCurrentProject } from "components/Project/ProjectActions";
import { useAppDispatch } from "types/hooks";
import { Path } from "types/path";

export default function ChooseProject(): ReactElement {
  const dispatch = useAppDispatch();

  const [projectList, setProjectList] = useState<Project[]>([]);

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      getAllActiveProjectsByUser(userId).then((projects) => {
        projects.sort((a: Project, b: Project) => a.name.localeCompare(b.name));
        setProjectList(projects);
      });
    }
  }, []);

  const selectProject = (project: Project): void => {
    dispatch(setNewCurrentProject(project));
    navigate(Path.Goals);
  };

  return (
    <Card style={{ width: "100%", maxWidth: 450 }}>
      <CardContent>
        {/* Title */}
        <Typography variant="h5" align="center" gutterBottom>
          {t("selectProject.title")}
        </Typography>

        {/* List of projects */}
        <List>
          {projectList.map((project, index) => (
            <ListItemButton
              key={project.id}
              id={`choose-project-${index}`}
              onClick={() => selectProject(project)}
            >
              <Typography variant="h6">{project.name}</Typography>
            </ListItemButton>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
