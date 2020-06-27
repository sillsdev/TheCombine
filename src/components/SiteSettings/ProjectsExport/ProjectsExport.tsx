import { List, ListItem, Typography } from "@material-ui/core";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { getAllProjects } from "../../../backend";
import { Project } from "../../../types/project";
import theme from "../../../types/theme";
import ExportProjectButton from "../../ProjectSettings/ProjectExport/ExportProjectButton";

interface ExportsProps {
  project: Project;
  setCurrentProject: (project: Project) => void;
}

interface ExportsState {
  projectList: Project[];
}

export class ProjectsExport extends React.Component<
  ExportsProps & LocalizeContextProps,
  ExportsState
> {
  constructor(props: ExportsProps & LocalizeContextProps) {
    super(props);

    this.state = {
      projectList: [],
    };

    getAllProjects().then((projects) => {
      this.setState({ projectList: projects });
    });
  }

  componentDidUpdate(prevProps: ExportsProps) {
    if (prevProps.project.name !== this.props.project.name) {
      getAllProjects().then((projects) => {
        this.setState({ projectList: projects });
      });
    }
  }

  private selectProject(project: Project) {
    this.props.setCurrentProject(project);
  }

  getListItems() {
    return this.state.projectList.map((project) => {
      const isCurrentProject: boolean = project.id === this.props.project.id;
      return (
        <ListItem
          key={project.id}
          button
          onClick={() => this.selectProject(project)}
        >
          <Typography
            variant="h6"
            color={isCurrentProject ? "inherit" : "textSecondary"}
            style={{ marginRight: theme.spacing(1) }}
          >
            {project.name}
          </Typography>

          {/* Export Lift file */}
          {isCurrentProject ? <ExportProjectButton /> : null}
        </ListItem>
      );
    });
  }

  render() {
    return <List>{this.getListItems()}</List>;
  }
}

export default withLocalize(ProjectsExport);
