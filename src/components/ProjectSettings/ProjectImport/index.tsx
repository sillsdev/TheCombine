import ProjectImport from "./ProjectImport";
import { Project } from "../../../types/project";
import { setCurrentProject, ProjectAction } from "../../Project/ProjectActions";
import { Dispatch } from "redux";
import { connect } from "react-redux";

function mapDispatchToProps(dispatch: Dispatch<ProjectAction>) {
  return {
    updateProject: (newProject: Project) =>
      dispatch(setCurrentProject(newProject))
  };
}

export default connect(
  null,
  mapDispatchToProps
)(ProjectImport);
