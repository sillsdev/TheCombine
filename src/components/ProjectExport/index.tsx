import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import { StoreState } from "../../types";
import {
  asyncExportProject,
  ExportProjectAction,
} from "./ExportProjectActions";
import ExportProjectButton from "./ExportProjectButton";

function mapStateToProps(state: StoreState) {
  return {
    exportResult: state.exportProjectState,
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ExportProjectAction>
) {
  return {
    exportProject: (projectId: string) => {
      dispatch(asyncExportProject(projectId));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExportProjectButton);
