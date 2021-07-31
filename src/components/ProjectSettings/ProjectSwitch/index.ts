import { connect } from "react-redux";

import { Project } from "api/models";
import { asyncSetNewCurrentProject } from "components/Project/ProjectActions";
import ProjectSwitch from "components/ProjectSettings/ProjectSwitch/ProjectSwitch";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState) {
  return { project: state.currentProjectState.project };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setCurrentProject: (project: Project) => {
      dispatch(asyncSetNewCurrentProject(project));
    },
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ProjectSwitch);
