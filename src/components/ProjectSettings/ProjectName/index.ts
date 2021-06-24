import { connect } from "react-redux";

import { Project } from "api/models";
import { saveChangesToProject } from "components/Project/ProjectActions";
import ProjectName from "components/ProjectSettings/ProjectName/ProjectName";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState) {
  return { project: state.currentProject };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    saveChangesToProject: (project: Project) =>
      saveChangesToProject(project, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ProjectName);
