import { List, ListItem, Typography } from "@material-ui/core";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

import { getAllProjects } from "../../../backend";
import { Project } from "../../../types/project";
import theme from "../../../types/theme";
import ExportProjectButton from "../../ProjectSettings/ProjectExport/ExportProjectButton";
import ProjectButtonWithConfirmation from "./ProjectButtonWithConfirmation";

interface ProjectManagementState {
  activeProjects: Project[];
  archivedProjects: Project[];
}

export class ProjectManagement extends React.Component<
  LocalizeContextProps,
  ProjectManagementState
> {
  constructor(props: LocalizeContextProps) {
    super(props);

    this.state = {
      activeProjects: [],
      archivedProjects: [],
    };
    this.updateProjectList();
  }

  updateProjectList = () => {
    getAllProjects().then((projects) => {
      this.setState({
        activeProjects: projects.filter((project) => project.isActive),
        archivedProjects: projects.filter((project) => !project.isActive),
      });
    });
  };

  getListItems(projects: Project[]) {
    return projects.map((project) => {
      return (
        <ListItem key={project.id}>
          <Typography
            variant="h6"
            color={project.isActive ? "inherit" : "textSecondary"}
            style={{ marginRight: theme.spacing(1) }}
          >
            {project.name}
          </Typography>
          {/* Export Lift file */}
          <ExportProjectButton
            projectId={project.id}
            style={{ marginRight: theme.spacing(1) }}
          />
          {/* Archive active project or restore archived project. */}
          <ProjectButtonWithConfirmation
            archive={project.isActive}
            projectId={project.id}
            updateParent={this.updateProjectList}
          />
        </ListItem>
      );
    });
  }

  render() {
    return (
      <List>
        {this.getListItems(this.state.activeProjects)}
        {this.getListItems(this.state.archivedProjects)}
      </List>
    );
  }
}

export default withLocalize(ProjectManagement);
