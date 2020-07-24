import CreateProject from "./CreateProjectComponent";
import { StoreState } from "../../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  CreateProjectAction,
  asyncCreateProject,
  reset,
} from "./CreateProjectActions";
import { ProjectAction } from "../../Project/ProjectActions";
import { WritingSystem } from "../../../types/project";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
    inProgress: state.createProjectState.inProgress,
    success: state.createProjectState.success,
    errorMsg: state.createProjectState.errorMsg,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CreateProjectAction | ProjectAction>
) {
  return {
    asyncCreateProject: (
      name: string,
      vernacularLanguage: WritingSystem,
      analysisLanguages: WritingSystem[],
      languageData: File
    ) => {
      dispatch(
        asyncCreateProject(
          name,
          vernacularLanguage,
          analysisLanguages,
          languageData
        )
      );
    },
    reset: () => {
      dispatch(reset());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateProject);
