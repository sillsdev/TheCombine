import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { type Project } from "api/models";
import { getAllActiveProjects } from "backend";
import { asyncSetNewCurrentProject } from "components/Project/ProjectActions";
import { useAppDispatch } from "rootRedux/hooks";
import { Path } from "types/path";

export default function ChooseProject(): ReactElement {
  const dispatch = useAppDispatch();

  const [projectList, setProjectList] = useState<Project[]>([]);

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    getAllActiveProjects().then((projects) => {
      setProjectList(projects.sort((a, b) => a.name.localeCompare(b.name)));
    });
  }, []);

  const selectProject = async (project: Project): Promise<void> => {
    await dispatch(asyncSetNewCurrentProject(project));
    navigate(Path.DataEntry);
  };

  return (
    <Card style={{ width: "100%", maxWidth: 450 }}>
      <CardContent>
        {/* Title */}
        <Typography variant="h5" align="center" gutterBottom>
          {t("selectProject.title")}
        </Typography>

        {/* List of projects */}
        <List dense>
          {projectList.map((project, index) => (
            <ListItem key={project.id} sx={{ py: 0 }}>
              <ListItemButton
                id={`choose-project-${index}`}
                onClick={() => selectProject(project)}
                sx={{ borderTop: "1px solid #ddd", py: 1 }}
              >
                <Typography variant="h6">{project.name}</Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
