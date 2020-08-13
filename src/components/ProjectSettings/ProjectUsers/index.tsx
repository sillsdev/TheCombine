import ActiveUsersComponent from "./ActiveUsers";
import ProjectUsers from "./ProjectUsers";
import { connect } from "react-redux";
import { StoreState } from "../../../types";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

export let ActiveUsers = connect(mapStateToProps)(ActiveUsersComponent);

export default connect(mapStateToProps)(ProjectUsers);
