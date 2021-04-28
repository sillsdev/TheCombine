import { connect } from "react-redux";

import { saveChangesToProject } from "components/Project/ProjectActions";
import ProjectLanguages from "components/ProjectSettings/ProjectLanguages/ProjectLanguages";
import { StoreState } from "types";
import { Project } from "types/project";
import { StoreStateDispatch } from "types/Redux/actions";

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
