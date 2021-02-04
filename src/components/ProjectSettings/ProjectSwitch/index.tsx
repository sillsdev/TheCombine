import { connect } from "react-redux";

import { setCurrentProject } from "components/Project/ProjectActions";
import ProjectSwitch from "components/ProjectSettings/ProjectSwitch/ProjectSwitch";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { Project } from "types/project";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setCurrentProject: (project: Project) => {
      dispatch(setCurrentProject(project));
    },
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ProjectSwitch);
