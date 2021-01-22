import { connect } from "react-redux";

import ActiveUsersComponent from "components/ProjectSettings/ProjectUsers/ActiveUsers";
import ProjectUsers from "components/ProjectSettings/ProjectUsers/ProjectUsers";
import { StoreState } from "types";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

export let ActiveUsers = connect(mapStateToProps)(ActiveUsersComponent);

export default connect(mapStateToProps)(ProjectUsers);
