import { connect } from "react-redux";
import { Dispatch } from "redux";

import { StoreState } from "../../../types";
import { Project } from "../../../types/project";
import { ProjectAction, setCurrentProject } from "../../Project/ProjectActions";
import ProjectManagement from "./ProjectManagement";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<ProjectAction>) {
  return {
    setCurrentProject: (project: Project) => {
      dispatch(setCurrentProject(project));
    },
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ProjectManagement);
