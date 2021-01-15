import { connect } from "react-redux";

import { StoreState } from "../../../types";
import { StoreStateDispatch } from "../../../types/actions";
import { Project } from "../../../types/project";
import { saveChangesToProject } from "../../Project/ProjectActions";
import ProjectLanguages from "./ProjectLanguages";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    saveChangesToProject: (project: Project) =>
      saveChangesToProject(project, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectLanguages);
