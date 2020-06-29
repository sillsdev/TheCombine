import { List, ListItem, Typography } from "@material-ui/core";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { getAllProjects } from "../../../backend";
import { Project } from "../../../types/project";
import theme from "../../../types/theme";
import ExportProjectButton from "../../ProjectSettings/ProjectExport/ExportProjectButton";

interface ExportsState {
  projectList: Project[];
}

export class ProjectsExport extends React.Component<
  LocalizeContextProps,
  ExportsState
> {
  constructor(props: LocalizeContextProps) {
    super(props);

    this.state = {
      projectList: [],
    };

    getAllProjects().then((projects) => {
      this.setState({ projectList: projects });
    });
  }

  getListItems() {
    return this.state.projectList.map((project) => {
      return (
        <ListItem key={project.id}>
          <Typography
            variant="h6"
            color={"textSecondary"}
            style={{ marginRight: theme.spacing(1) }}
          >
            {project.name}
          </Typography>

          {/* Export Lift file */}
          <ExportProjectButton projectId={project.id} />
        </ListItem>
      );
    });
  }

  render() {
    return <List>{this.getListItems()}</List>;
  }
}

export default withLocalize(ProjectsExport);
