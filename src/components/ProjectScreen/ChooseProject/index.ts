import { connect } from "react-redux";

import { Project } from "api/models";
import { setCurrentProject } from "components/Project/ProjectActions";
import ChooseProjectComponent from "components/ProjectScreen/ChooseProject/ChooseProjectComponent";
import { StoreStateDispatch } from "types/Redux/actions";

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setCurrentProject: (project: Project) => {
      dispatch(setCurrentProject(project));
    },
  };
}

export default connect(null, mapDispatchToProps)(ChooseProjectComponent);
