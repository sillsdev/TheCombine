import { connect } from "react-redux";

import { StoreStateDispatch } from "../../../types/actions";
import { Project } from "../../../types/project";
import { setCurrentProject } from "../../Project/ProjectActions";
import ChooseProjectComponent from "./ChooseProjectComponent";

export function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setCurrentProject: (project: Project) => {
      dispatch(setCurrentProject(project));
    },
  };
}

export default connect(null, mapDispatchToProps)(ChooseProjectComponent);
