import { List, ListItem, Typography } from "@material-ui/core";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { getAllProjects } from "../../../backend";
import { setProjectId } from "../../../backend/localStorage";
import { Project } from "../../../types/project";
import theme from "../../../types/theme";
import ExportProjectButton from "../../ProjectSettings/ProjectExport/ExportProjectButton";
import DeleteProjectButton from "./DeleteProjectButton";
import RestoreProjectButton from "./RestoreProjectButton";

interface ProjectManagementState {
  activeProjects: Project[];
  deletedProjects: Project[];
}

export class ProjectManagement extends React.Component<
  LocalizeContextProps,
  ProjectManagementState
> {
  constructor(props: LocalizeContextProps) {
    super(props);

    this.state = {
      activeProjects: [],
      deletedProjects: [],
    };

    setProjectId("");
    this.updateProjectList();
  }

  updateProjectList = () => {
    getAllProjects().then((projects) => {
      this.setState({
        activeProjects: projects.filter((project) => project.active),
        deletedProjects: projects.filter((project) => !project.active),
      });
    });
  };

  getListItems(projects: Project[]) {
    return projects.map((project) => {
      return (
        <ListItem key={project.id}>
          <Typography
            variant="h6"
            color={project.active ? "inherit" : "textSecondary"}
            style={{ marginRight: theme.spacing(1) }}
          >
            {project.name}
          </Typography>
          {/* Export Lift file */}
          <ExportProjectButton
            projectId={project.id}
            style={{ marginRight: theme.spacing(1) }}
          />
          {/* Delete active project or restore deleted project. */}
          {project.active ? (
            <DeleteProjectButton
              projectId={project.id}
              updateParent={this.updateProjectList}
            />
          ) : (
            <RestoreProjectButton
              projectId={project.id}
              updateParent={this.updateProjectList}
            />
          )}
        </ListItem>
      );
    });
  }

  render() {
    return (
      <List>
        {this.getListItems(this.state.activeProjects)}
        {this.getListItems(this.state.deletedProjects)}
      </List>
    );
  }
}

export default withLocalize(ProjectManagement);
