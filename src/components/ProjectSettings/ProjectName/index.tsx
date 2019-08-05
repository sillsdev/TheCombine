import ProjectName from "./ProjectName";
import { StoreState } from "../../../types";
import { connect } from "react-redux";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject
  };
}

export default connect(
  mapStateToProps,
  null
)(ProjectName);
