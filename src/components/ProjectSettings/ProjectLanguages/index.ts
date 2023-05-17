import { connect } from "react-redux";

import { Project } from "api/models";
import { asyncUpdateCurrentProject } from "components/Project/ProjectActions";
import ProjectLanguages from "components/ProjectSettings/ProjectLanguages/ProjectLanguages";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState) {
  return { project: state.currentProjectState.project };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    saveChangesToProject: async (project: Project) =>
      await dispatch(asyncUpdateCurrentProject(project)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectLanguages);
