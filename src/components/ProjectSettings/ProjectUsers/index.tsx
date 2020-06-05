import ProjectUsers from "./ProjectUsers";
import { connect } from "react-redux";
import { StoreState } from "../../../types";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

export default connect(mapStateToProps)(ProjectUsers);
