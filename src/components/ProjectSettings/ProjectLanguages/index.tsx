import ProjectLanguages from "./ProjectLanguages";
import { StoreState } from "../../../types";
import { connect } from "react-redux";

import { Dispatch } from "redux";
import { ProjectAction, setCurrentProject } from "../../Project/ProjectActions";
import { Project } from "../../../types/project";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}
export default connect(mapStateToProps)(ProjectLanguages);
