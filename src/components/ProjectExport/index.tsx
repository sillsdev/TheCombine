import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { asyncExportProject } from "components/ProjectExport/Redux/ExportProjectActions";
import ExportProjectButton from "components/ProjectExport/ExportProjectButton";

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
