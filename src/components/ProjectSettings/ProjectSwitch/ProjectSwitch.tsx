import { List, ListItem, Typography } from "@material-ui/core";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { getAllProjectsByUser } from "../../../backend";
import { getCurrentUser } from "../../../backend/localStorage";
import { Project } from "../../../types/project";
import { User } from "../../../types/user";

interface SwitchProps {
  project: Project;
  setCurrentProject: (project: Project) => void;
}

interface SwitchState {
  projectList: Array<Project>;
  currentUser: User | null;
}

export class ProjectSwitch extends React.Component<
  SwitchProps & LocalizeContextProps,
  SwitchState
> {
  constructor(props: SwitchProps & LocalizeContextProps) {
    super(props);

    this.state = {
      projectList: [],
      currentUser: getCurrentUser(),
    };

    if (this.state.currentUser) {
      getAllProjectsByUser(this.state.currentUser).then((projects) => {
        this.setState({ projectList: projects });
      });
    }
  }

  componentDidUpdate(prevProps: SwitchProps) {
    if (
      prevProps.project.name !== this.props.project.name &&
      this.state.currentUser
    ) {
      getAllProjectsByUser(this.state.currentUser).then((projects) => {
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
          key={project.id}
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

export default withLocalize(ProjectSwitch);
