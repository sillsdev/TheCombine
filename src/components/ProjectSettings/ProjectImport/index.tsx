import ProjectImport from "./ProjectImport";
import { Project } from "../../../types/project";
import { setCurrentProject, ProjectAction } from "../../Project/ProjectActions";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { StoreState } from "../../../types";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

function mapDispatchToProps(dispatch: Dispatch<ProjectAction>) {
  return {
    updateProject: (newProject: Project) =>
      dispatch(setCurrentProject(newProject)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectImport);
