import CreateProject from "./CreateProjectComponent";
import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  CreateProjectAction,
  asyncCreateProject
} from "./CreateProjectActions";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
    inProgress: state.createProjectState.inProgress,
    success: state.createProjectState.success,
    errorMsg: state.createProjectState.errorMsg
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CreateProjectAction>
) {
  return {
    asyncCreateProject: (name: string, languageData: File) => {
      dispatch(asyncCreateProject(name, languageData));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateProject);
