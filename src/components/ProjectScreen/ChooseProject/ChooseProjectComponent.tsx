import {
  Card,
  CardContent,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import { Project } from "api/models";
import { getAllActiveProjectsByUser } from "backend";
import { getUserId } from "backend/localStorage";
import history, { Path } from "browserHistory";

interface ChooseProjectProps {
  setCurrentProject: (project: Project) => void;
}

interface ChooseProjectState {
  projectList: Project[];
}

export default class ChooseProject extends React.Component<
  ChooseProjectProps,
  ChooseProjectState
> {
  constructor(props: ChooseProjectProps) {
    super(props);
    this.state = { projectList: [] };
    const userId = getUserId();
    if (userId) {
      getAllActiveProjectsByUser(userId).then((projectList) => {
        this.setState({ projectList });
      });
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
            <Translate id="selectProject.title" />
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
