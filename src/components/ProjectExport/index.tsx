import { connect } from "react-redux";

import ExportProjectButton from "components/ProjectExport/ExportProjectButton";
import { asyncExportProject } from "components/ProjectExport/Redux/ExportProjectActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

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
