import UserSettingsComponent, { UserWithRole } from "./UserSettingsComponent";
import { StoreState } from "../../../types";
import { connect } from "react-redux";
import {
  ProjectSettingsAction,
  getUsers,
  removeUserFromProject,
  addUser,
  wipeUsers
} from "../ProjectSettingsActions";
import { ThunkDispatch } from "redux-thunk";
import { UserRole } from "../../../types/userRole";

function mapStateToProps(state: StoreState) {
  return {
    users: state.projectSettingsState.users,
    otherUsers: state.projectSettingsState.otherUsers
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ProjectSettingsAction>
) {
  return {
    getUsers: () => dispatch(getUsers()),
    addUserToProject: (userRole: UserRole, role: string) =>
      dispatch(addUser(userRole, role)),
    removeUserFromProject: (removeUser: UserWithRole) => {
      dispatch(removeUserFromProject(removeUser));
    },
    resetUsers: () => {
      dispatch(wipeUsers());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserSettingsComponent);
