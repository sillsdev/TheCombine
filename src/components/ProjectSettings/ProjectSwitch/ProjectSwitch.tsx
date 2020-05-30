import React from "react";
import { Project } from "../../../types/project";
import { getCurrentUser } from "../../../backend/localStorage";
import { getAllProjectsByUser } from "../../../backend";
import { List, ListItem, Typography } from "@material-ui/core";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import LoadingButton from "../../Buttons/LoadingButton";
import { TypographyProps } from "@material-ui/core/Typography";
import { TypographyStyle } from "@material-ui/core/styles";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

interface SwitchProps {
  project: Project;
  setCurrentProject: (project: Project) => void;
}

interface SwitchState {
  projectList: Array<Project>;
  loading: boolean;
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
    };
  }

  componentWillMount() {
    const user = getCurrentUser();
    if (user) {
      getAllProjectsByUser(user).then((projects) => {
        this.setState({ projectList: projects, loading: false });
      });
    }
  }

  private selectProject(project: Project) {
    this.props.setCurrentProject(project);
  }

  render() {
    if (this.state.loading) {
      return LoadingButton;
    } else {
      return (
        <List>
          {this.state.projectList.map((project) => {
            let textColor: TypographyProps["color"] = "textSecondary";

            if (project.name == this.props.project.name) {
              textColor = "inherit";
            }
            return (
              <ListItem
                key={project.id}
                button
                onClick={() => this.selectProject(project)}
              >
                <Typography variant="h6" color={textColor}>
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
