import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import { StoreState } from "../../../types";
import {
  asyncDownloadExport,
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
    exportProject: (projectId?: string) => {
      dispatch(asyncExportProject(projectId));
    },
    downloadLift: (projectId?: string) => {
      return dispatch(asyncDownloadExport(projectId));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExportProjectButton);
