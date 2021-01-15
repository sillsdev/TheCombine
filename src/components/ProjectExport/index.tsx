import { connect } from "react-redux";

import { StoreState } from "../../types";
import { StoreStateDispatch } from "../../types/actions";
import { asyncExportProject } from "./ExportProjectActions";
import ExportProjectButton from "./ExportProjectButton";

function mapStateToProps(state: StoreState) {
  return {
    exportResult: state.exportProjectState,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
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
