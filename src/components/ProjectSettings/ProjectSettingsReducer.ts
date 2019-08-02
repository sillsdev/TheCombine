import { UserWithRole } from "./UserSettingsComponent/UserSettingsComponent";
import { User } from "../../types/user";
import {
  ProjectSettingsAction,
  ProjectSettingsActions
} from "./ProjectSettingsActions";

export interface ProjectSettingsState {
  users: UserWithRole[];
  otherUsers: UserWithRole[];
}

export const defaultState: ProjectSettingsState = {
  users: [],
  otherUsers: []
};

export const projectSettingsReducer = (
  state: ProjectSettingsState = defaultState,
  action: ProjectSettingsAction
): ProjectSettingsState => {
  switch (action.type) {
    case ProjectSettingsActions.AddUserToProject:
      return {
        ...state,
        users: [...state.users, action.newUser],
        otherUsers: state.otherUsers.filter(
          user => user.id !== action.newUser.id
        )
      };

    case ProjectSettingsActions.RemoveUserFromProject:
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.removeUser.id),
        otherUsers: [...state.otherUsers, action.removeUser]
      };

    case ProjectSettingsActions.FillUsers:
      return {
        users: action.users,
        otherUsers: action.otherUsers
      };

    case ProjectSettingsActions.WipeUsers:
      return defaultState;

    default:
      return state;
  }
};
