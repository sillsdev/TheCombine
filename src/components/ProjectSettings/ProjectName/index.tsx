import { connect } from "react-redux";

import { saveChangesToProject } from "components/Project/ProjectActions";
import ProjectName from "components/ProjectSettings/ProjectName/ProjectName";
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
    saveChangesToProject: (project: Project) =>
      saveChangesToProject(project, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ProjectName);
