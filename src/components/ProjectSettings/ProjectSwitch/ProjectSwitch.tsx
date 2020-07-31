import { List, ListItem, Typography } from "@material-ui/core";
import React from "react";

import { getAllActiveProjectsByUser } from "../../../backend";
import { getCurrentUser } from "../../../backend/localStorage";
import { Project } from "../../../types/project";
import { User } from "../../../types/user";
import { randomIntString } from "../../../utilities";

interface SwitchProps {
  project: Project;
  setCurrentProject: (project: Project) => void;
}

interface SwitchState {
  projectList: Project[];
  currentUser: User | null;
}

export class ProjectSwitch extends React.Component<SwitchProps, SwitchState> {
  constructor(props: SwitchProps) {
    super(props);

    this.state = {
      projectList: [],
      currentUser: getCurrentUser(),
    };

    this.updateProjectList();
  }

  componentDidUpdate(prevProps: SwitchProps) {
    if (prevProps.project.name !== this.props.project.name) {
      this.updateProjectList();
    }
  }

  private updateProjectList() {
    if (this.state.currentUser) {
      getAllActiveProjectsByUser(this.state.currentUser).then((projects) => {
        this.setState({ projectList: projects });
      });
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
