import ProjectName from "./ProjectName";
import { StoreState } from "../../../types";
import { connect } from "react-redux";

import { Dispatch } from "redux";
import { ProjectAction, setCurrentProject } from "../../Project/ProjectActions";
import { Project } from "../../../types/project";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject
  };
}

export function mapDispatchToProps(dispatch: Dispatch<ProjectAction>) {
  return {
    setCurrentProject: (project: Project) => {
      dispatch(setCurrentProject(project));
    }
  };
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectName);
