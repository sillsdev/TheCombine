import { List, ListItem, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import { Project } from "api/models";
import { getAllProjects } from "backend";
import ExportButton from "components/ProjectExport/ExportButton";
import ProjectArchive from "components/ProjectSettings/ProjectArchive";
import ProjectUsersButtonWithConfirmation from "components/SiteSettings/ProjectManagement/ProjectUsersButtonWithConfirmation";
import theme from "types/theme";

export default function ProjectManagement() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);

  useEffect(() => {
    updateProjectList();
  }, []);

  async function updateProjectList(): Promise<void> {
    await getAllProjects().then(setAllProjects);
  }

  // Sort projects into active vs archived as conditional effect here rather than inside
  // the ProjectList function to avoid react mounting/rendering error in console.
  useEffect(() => {
    setActiveProjects(
      allProjects
        .filter((project) => project.isActive)
        .sort((a: Project, b: Project) => a.name.localeCompare(b.name))
    );
    setArchivedProjects(
      allProjects
        .filter((project) => !project.isActive)
        .sort((a: Project, b: Project) => a.name.localeCompare(b.name))
    );
  }, [allProjects]);

  return ProjectList(activeProjects, archivedProjects, updateProjectList);
}

// Extract and export for unit testing.
export function ProjectList(
  activeProjects: Project[],
  archivedProjects: Project[],
  updateProjects: () => Promise<void>
): ReactElement {
  function getListItems(projects: Project[]): ReactElement[] {
    return projects.map((project) => (
      <ListItem key={project.id}>
        <Typography
          variant="h6"
          color={project.isActive ? "inherit" : "textSecondary"}
          style={{ marginRight: theme.spacing(1) }}
        >
          {project.name}
        </Typography>
        {/* Export Lift file */}
        <ExportButton projectId={project.id} />
        {/* Manage project users. */}
        <ProjectUsersButtonWithConfirmation projectId={project.id} />
        {/* Archive active project or restore archived project. */}
        <ProjectArchive
          archive={project.isActive}
          projectId={project.id}
          updateParent={updateProjects}
        />
      </ListItem>
    ));
  }

  return (
    <List>
      {getListItems(activeProjects)}
      {getListItems(archivedProjects)}
    </List>
  );
}
