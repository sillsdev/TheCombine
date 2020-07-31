import { connect } from "react-redux";

import { StoreState } from "../../../types";
import ProjectLanguages from "./ProjectLanguages";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}
export default connect(mapStateToProps)(ProjectLanguages);
