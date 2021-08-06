import { connect } from "react-redux";

import { Project } from "api/models";
import { setCurrentProject } from "components/Project/ProjectActions";
import ProjectImport from "components/ProjectSettings/ProjectImport/ProjectImport";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState) {
  return { projectId: state.currentProjectState.project.id };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    updateProject: (newProject: Project) =>
      dispatch(setCurrentProject(newProject)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectImport);
