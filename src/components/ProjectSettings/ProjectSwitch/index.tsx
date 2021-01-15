import { connect } from "react-redux";

import { StoreState } from "../../../types";
import { StoreStateDispatch } from "../../../types/actions";
import { Project } from "../../../types/project";
import { setCurrentProject } from "../../Project/ProjectActions";
import ProjectSwitch from "./ProjectSwitch";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

export function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setCurrentProject: (project: Project) => {
      dispatch(setCurrentProject(project));
    },
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ProjectSwitch);
