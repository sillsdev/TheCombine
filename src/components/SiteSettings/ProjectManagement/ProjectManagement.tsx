import { List, ListItem, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";

import { Project } from "api/models";
import { getAllProjects } from "backend";
import ExportButton from "components/ProjectExport/ExportButton";
import ProjectButtonWithConfirmation from "components/SiteSettings/ProjectManagement/ProjectButtonWithConfirmation";
import theme from "types/theme";

export default function ProjectManagement() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);

  useEffect(() => {
    updateProjectList();
  }, [setAllProjects]);

  async function updateProjectList() {
    await getAllProjects().then(setAllProjects);
  }

  // Sort projects into active vs archived as conditional effect here rather than inside
  // the ProjectList function to avoid react mounting/rendering error in console.
  useEffect(() => {
    setActiveProjects(allProjects.filter((project) => project.isActive));
    setArchivedProjects(allProjects.filter((project) => !project.isActive));
  }, [allProjects, setActiveProjects, setArchivedProjects]);

  return ProjectList(activeProjects, archivedProjects, updateProjectList);
}

// Extract and export for unit testing.
export function ProjectList(
  activeProjects: Project[],
  archivedProjects: Project[],
  updateProjects: () => Promise<void>
) {
  function getListItems(projects: Project[]) {
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
        <ExportButton
          projectId={project.id}
          buttonProps={{ style: { marginRight: theme.spacing(1) } }}
        />
        {/* Archive active project or restore archived project. */}
        <ProjectButtonWithConfirmation
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
