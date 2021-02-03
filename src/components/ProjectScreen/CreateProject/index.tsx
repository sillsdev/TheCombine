import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { WritingSystem } from "types/project";
import {
  asyncCreateProject,
  reset,
} from "components/ProjectScreen/CreateProject/CreateProjectActions";
import CreateProject from "components/ProjectScreen/CreateProject/CreateProjectComponent";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
    inProgress: state.createProjectState.inProgress,
    success: state.createProjectState.success,
    errorMsg: state.createProjectState.errorMsg,
  };
}

export function mapDispatchToProps(dispatch: StoreStateDispatch) {
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
