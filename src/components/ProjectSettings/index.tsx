import { connect } from "react-redux";

import { StoreState } from "types";
import ProjectSettingsComponent from "components/ProjectSettings/ProjectSettingsComponent";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

export default connect(mapStateToProps)(ProjectSettingsComponent);
