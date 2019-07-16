import { Dispatch } from "redux";
import { ProjectAction, setCurrentProject } from "../../Project/ProjectActions";
import { Project } from "../../../types/project";
import { connect } from "react-redux";
import ChooseProjectComponent from "./ChooseProjectComponent";

export function mapDispatchToProps(dispatch: Dispatch<ProjectAction>) {
  return {
    setCurrentProject: (project: Project) => {
      dispatch(setCurrentProject(project));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(ChooseProjectComponent);
