import { User } from "../../types/user";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../types";
import { Project } from "../../types/project";
import { UserWithRole } from "./UserSettingsComponent/UserSettingsComponent";
import * as backend from "../../backend";
import { UserRole } from "../../types/userRole";

export enum ProjectSettingsActions {
  FillUsers = "FILL_USERS",
  AddUserToProject = "ADD_USER_TO_PROJECT",
  RemoveUserFromProject = "REMOVE_USER_FROM_PROJECT",
  WipeUsers = "WIPE_USERS"
}

interface FillUsersAction {
  type: ProjectSettingsActions.FillUsers;
  users: UserWithRole[];
  otherUsers: UserWithRole[];
}

interface AddUserAction {
  type: ProjectSettingsActions.AddUserToProject;
  newUser: UserWithRole;
}

interface RemoveUserAction {
  type: ProjectSettingsActions.RemoveUserFromProject;
  removeUser: UserWithRole;
}

interface WipeUserAction {
  type: ProjectSettingsActions.WipeUsers;
}

export type ProjectSettingsAction =
  | FillUsersAction
  | AddUserAction
  | RemoveUserAction
  | WipeUserAction;

export function getUsers() {
  return async (
    dispatch: ThunkDispatch<StoreState, any, ProjectSettingsAction>
  ) => {
    let users: UserWithRole[] = (await backend.getAllUsersInCurrentProject()).map(
      (user: User) => ({
        ...user,
        role: "a role"
      })
    );
    let otherUsers: UserWithRole[] = (await backend.getAllUsers())
      .filter((user: User) => users.find(check => user.id !== check.id))
      .map((user: User) => ({
        ...user,
        role: "a role"
      }));

    dispatch(addUsers(users, otherUsers));
  };
}

export function addUser(userRole: UserRole, role: string) {
  return async (
    dispatch: ThunkDispatch<StoreState, any, ProjectSettingsAction>
  ) => {
    backend.addUserRole(userRole).then(value => {
      dispatch(addUserToProject({ ...value, role }));
    });
  };
}

export function addUserToProject(newUser: UserWithRole): AddUserAction {
  return {
    type: ProjectSettingsActions.AddUserToProject,
    newUser
  };
}

export function removeUserFromProject(
  removeUser: UserWithRole
): RemoveUserAction {
  return {
    type: ProjectSettingsActions.RemoveUserFromProject,
    removeUser
  };
}

export function addUsers(
  users: UserWithRole[],
  otherUsers: UserWithRole[]
): FillUsersAction {
  return {
    type: ProjectSettingsActions.FillUsers,
    users,
    otherUsers
  };
}

export function wipeUsers(): WipeUserAction {
  return {
    type: ProjectSettingsActions.WipeUsers
  };
}
