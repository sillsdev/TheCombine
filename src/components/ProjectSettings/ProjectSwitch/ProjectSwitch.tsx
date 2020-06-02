import React from "react";
import { Project } from "../../../types/project";
import { getCurrentUser } from "../../../backend/localStorage";
import { getAllProjectsByUser } from "../../../backend";
import { List, ListItem, Typography } from "@material-ui/core";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { User } from "../../../types/user";

interface SwitchProps {
  project: Project;
  setCurrentProject: (project: Project) => void;
}

interface SwitchState {
  projectList: Array<Project>;
  loading: boolean;
  currentProjectID: string;
  currentUser: User | null;
}

class ProjectSwitch extends React.Component<
  SwitchProps & LocalizeContextProps,
  SwitchState
> {
  constructor(props: SwitchProps & LocalizeContextProps) {
    super(props);

    this.state = {
      projectList: [],
      loading: true,
      currentProjectID: props.project.id,
      currentUser: getCurrentUser(),
    };
  }

  componentWillMount() {
    if (this.state.currentUser) {
      getAllProjectsByUser(this.state.currentUser).then((projects) => {
        this.setState({ projectList: projects, loading: false });
      });
    }
  }

  componentDidUpdate(prevProps: SwitchProps) {
    if (
      prevProps.project.name !== this.props.project.name &&
      this.state.currentUser
    ) {
      getAllProjectsByUser(this.state.currentUser).then((projects) => {
        this.setState({ projectList: projects, loading: false });
      });
    }
  }

  private selectProject(project: Project) {
    this.setState({ currentProjectID: project.id });
    this.props.setCurrentProject(project);
  }

  render() {
    if (this.state.loading) {
      return <List></List>;
    } else {
      return (
        <List>
          {this.state.projectList.map((project) => {
            return (
              <ListItem
                key={project.id}
                button
                onClick={() => this.selectProject(project)}
              >
                <Typography
                  variant="h6"
                  color={
                    project.id !== this.props.project.id
                      ? "textSecondary"
                      : "inherit"
                  }
                >
                  {project.name}
                </Typography>
              </ListItem>
            );
          })}
        </List>
      );
    }
  }
}

export default withLocalize(ProjectSwitch);
