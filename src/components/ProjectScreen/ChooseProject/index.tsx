import { connect } from "react-redux";

import { setCurrentProject } from "components/Project/ProjectActions";
import ChooseProjectComponent from "components/ProjectScreen/ChooseProject/ChooseProjectComponent";
import { StoreStateDispatch } from "types/actions";
import { Project } from "types/project";

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setCurrentProject: (project: Project) => {
      dispatch(setCurrentProject(project));
    },
  };
}

export default connect(null, mapDispatchToProps)(ChooseProjectComponent);
