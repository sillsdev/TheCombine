import { Settings } from "@mui/icons-material";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Project } from "api/models";
import { getAllProjects } from "backend";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import ExportButton from "components/ProjectExport/ExportButton";
import ProjectArchive from "components/ProjectSettings/ProjectArchive";
import ProjectUsersButtonWithConfirmation from "components/SiteSettings/ProjectManagement/ProjectUsersButtonWithConfirmation";

/** Component for managing all projects in the database. */
export default function ProjectManagement(): ReactElement {
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

  return (
    <ProjectList
      activeProjects={activeProjects}
      archivedProjects={archivedProjects}
      updateProjects={updateProjectList}
    />
  );
}

interface ProjectListProps {
  activeProjects: Project[];
  archivedProjects: Project[];
  /** Function to trigger an update of all projects in the parent component. */
  updateProjects: () => Promise<void>;
}

// Extract and export for unit testing.
export function ProjectList(props: ProjectListProps): ReactElement {
  const [manageProjectId, setManageProjectId] = useState("");

  const { t } = useTranslation();

  const toggleManageProjectId = (projId: string): void => {
    setManageProjectId((prev) => (projId === prev ? "" : projId));
  };

  function getProjectManagement(project: Project): ReactNode {
    if (project.id !== manageProjectId) {
      return;
    }

    return (
      <Stack direction="row">
        {/* Export LIFT file */}
        <ExportButton projectId={project.id} />

        {/* Manage project users */}
        <ProjectUsersButtonWithConfirmation projectId={project.id} />

        {/* Archive active project or restore archived project */}
        <ProjectArchive
          archive={project.isActive}
          projectId={project.id}
          updateParent={props.updateProjects}
        />
      </Stack>
    );
  }

  /** Generates an array of items to fill a project List.
   * Adds a Divider and a ListItem For each project in the given Project array. */
  function getListItems(projects: Project[]): ReactElement[] {
    const items: ReactElement[] = [];
    for (const project of projects) {
      items.push(<Divider key={`divider-${project.id}`} />);
      items.push(
        <ListItem key={project.id}>
          <ListItemText>
            <Stack>
              <Stack direction="row">
                {/* Project name */}
                <Typography
                  color={project.isActive ? "inherit" : "textSecondary"}
                  sx={{ marginInlineEnd: 1 }}
                  variant="h6"
                >
                  {project.name}
                </Typography>

                {/* Button to open project management options */}
                <IconButtonWithTooltip
                  icon={<Settings />}
                  onClick={() => toggleManageProjectId(project.id)}
                  textId="siteSettings.manageProject"
                />
              </Stack>

              {/* Project management options */}
              {getProjectManagement(project)}
            </Stack>
          </ListItemText>
        </ListItem>
      );
    }
    return items;
  }

  return (
    <List>
      {/* Active projects */}
      <ListSubheader>
        <Typography variant="h5">
          {t("siteSettings.activeProjects", {
            val: props.activeProjects.length,
          })}
        </Typography>
      </ListSubheader>
      {getListItems(props.activeProjects)}

      {/* Archived projects */}
      <ListSubheader>
        <Typography variant="h5">
          {t("siteSettings.archivedProjects", {
            val: props.archivedProjects.length,
          })}
        </Typography>
      </ListSubheader>
      {getListItems(props.archivedProjects)}
    </List>
  );
}
