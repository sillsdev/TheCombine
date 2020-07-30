import { List, ListItem, Typography } from "@material-ui/core";
import React from "react";

import { getAllActiveProjectsByUser, getUser } from "../../../backend";
import { getUserId } from "../../../backend/localStorage";
import { Project } from "../../../types/project";
import { randomIntString } from "../../../utilities";

interface SwitchProps {
  project: Project;
  setCurrentProject: (project: Project) => void;
}

interface SwitchState {
  projectList: Project[];
  currentUserId: string;
}

export class ProjectSwitch extends React.Component<SwitchProps, SwitchState> {
  constructor(props: SwitchProps) {
    super(props);

    this.state = {
      projectList: [],
      currentUserId: getUserId(),
    };

    this.updateProjectList();
  }

  componentDidUpdate(prevProps: SwitchProps) {
    if (prevProps.project.name !== this.props.project.name) {
      this.updateProjectList();
    }
  }

  private updateProjectList() {
    if (this.state.currentUserId) {
      getUser(this.state.currentUserId).then((user) =>
        getAllActiveProjectsByUser(user).then((projects) => {
          this.setState({ projectList: projects });
        })
      );
    }
  }

  private selectProject(project: Project) {
    this.props.setCurrentProject(project);
  }

  getListItems() {
    return this.state.projectList.map((project) => {
      return (
        <ListItem
          key={project.id + randomIntString()}
          button
          onClick={() => this.selectProject(project)}
        >
          <Typography
            variant="h6"
            color={
              project.id !== this.props.project.id ? "textSecondary" : "inherit"
            }
          >
            {project.name}
          </Typography>
        </ListItem>
      );
    });
  }

  render() {
    return <List>{this.getListItems()}</List>;
  }
}

export default ProjectSwitch;
