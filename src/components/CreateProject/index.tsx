import CreateProject from "./CreateProjectComponent";
import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  createProject,
  CreateProjectAction,
  asyncCreateProject
} from "./CreateProjectActions";

function mapStateToProps(state: StoreState) {
  //console.log(state);
  return {
    project: state.currentProject
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CreateProjectAction>
) {
  return {
    createProject: (name: string, languageData: File) => {
      dispatch(createProject(name, languageData));
    },
    asyncCreateProject: (name: string, languageData: File) => {
      dispatch(asyncCreateProject(name, languageData));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateProject);
