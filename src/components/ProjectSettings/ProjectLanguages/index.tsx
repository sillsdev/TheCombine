import ProjectLanguages from "./ProjectLanguages";
import { StoreState } from "../../../types";
import { connect } from "react-redux";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}
export default connect(mapStateToProps)(ProjectLanguages);
