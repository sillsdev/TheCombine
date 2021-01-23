import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { Project } from "types/project";
import { setCurrentProject } from "components/Project/ProjectActions";
import ProjectImport from "components/ProjectSettings/ProjectImport/ProjectImport";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    updateProject: (newProject: Project) =>
      dispatch(setCurrentProject(newProject)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectImport);
