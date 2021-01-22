import {
  Card,
  CardContent,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { getAllActiveProjectsByUser } from "backend";
import { getUserId } from "backend/localStorage";
import history, { Path } from "browserHistory";
import { Project } from "types/project";

export interface ChooseProjectProps {
  setCurrentProject: (project: Project) => void;
}

export interface ChooseProjectState {
  projectList: Project[];
}

class ChooseProject extends React.Component<
  ChooseProjectProps & LocalizeContextProps,
  ChooseProjectState
> {
  constructor(props: ChooseProjectProps & LocalizeContextProps) {
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
            {this.state.projectList.map((project) => (
              <ListItem
                key={project.id}
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

export default withLocalize(ChooseProject);
