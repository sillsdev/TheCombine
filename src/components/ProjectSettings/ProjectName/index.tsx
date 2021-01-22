import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { Project } from "types/project";
import { saveChangesToProject } from "components/Project/ProjectActions";
import ProjectName from "components/ProjectSettings/ProjectName/ProjectName";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

export function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    saveChangesToProject: (project: Project) =>
      saveChangesToProject(project, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ProjectName);
