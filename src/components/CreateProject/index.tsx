import CreateProject from "./CreateProjectComponent";
import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { createProject, CreateProjectAction } from "./CreateProjectActions";

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CreateProjectAction>
) {
  return {
    createProject: (name: string, languageData: File) => {
      dispatch(createProject(name, languageData));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(CreateProject);
