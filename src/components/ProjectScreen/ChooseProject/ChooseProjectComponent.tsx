import {
  Card,
  CardContent,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";

import { Project } from "api/models";
import { getAllActiveProjectsByUser } from "backend";
import { getUserId } from "backend/localStorage";
import history, { Path } from "browserHistory";

interface ChooseProjectProps extends WithTranslation {
  setCurrentProject: (project: Project) => void;
}

interface ChooseProjectState {
  projectList: Project[];
}

export class ChooseProject extends React.Component<
  ChooseProjectProps,
  ChooseProjectState
> {
  constructor(props: ChooseProjectProps) {
    super(props);
    this.state = { projectList: [] };
  }

  async componentDidMount() {
    const userId = getUserId();
    if (userId) {
      const projectList = await getAllActiveProjectsByUser(userId);
      this.setState({ projectList });
    }
  }

  selectProject(project: Project) {
    this.props.setCurrentProject(project);
    history.push(Path.Goals);
  }

  render() {
    return (
      <Card style={{ width: "100%", maxWidth: 450 }}>
        <CardContent>
          {/* Title */}
          <Typography variant="h5" align="center" gutterBottom>
            {this.props.t("selectProject.title")}
          </Typography>

          {/* List of projects */}
          <List>
            {this.state.projectList.map((project, index) => (
              <ListItem
                key={project.id}
                id={`choose-project-${index}`}
                button
                onClick={() => this.selectProject(project)}
              >
                <Typography variant="h6">{project.name}</Typography>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }
}

export default withTranslation()(ChooseProject);
