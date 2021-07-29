import { projectReducer } from "components/Project/ProjectReducer";
import {
  CurrentProjectState,
  defaultState,
  ProjectAction,
  ProjectActionType,
} from "components/Project/ProjectReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";
import { newProject } from "types/project";
import { newUser } from "types/user";

describe("ProjectReducer", () => {
  it("returns default state when passed reset action", () => {
    const action: StoreAction = {
      type: StoreActionTypes.RESET,
    };

    expect(projectReducer({} as CurrentProjectState, action)).toEqual(
      defaultState
    );
  });

  describe("SetCurrentProject", () => {
    it("Preserves users when project id is the same", () => {
      const id = "same";
      const action: ProjectAction = {
        type: ProjectActionType.SET_CURRENT_PROJECT,
        payload: { ...newProject(), id },
      };

      const user = newUser();
      expect(
        projectReducer(
          { project: { id }, users: [user] } as CurrentProjectState,
          action
        )
      ).toEqual({ project: action.payload, users: [user] });
    });

    it("Resets users when project id changes", () => {
      const action: ProjectAction = {
        type: ProjectActionType.SET_CURRENT_PROJECT,
        payload: newProject(),
      };

      expect(
        projectReducer(
          {
            project: { id: "different" },
            users: [newUser()],
          } as CurrentProjectState,
          action
        )
      ).toEqual({ project: action.payload, users: [] });
    });
  });

  describe("SetCurrentProjectUsers", () => {
    it("Updates users; preserves project.", () => {
      const action: ProjectAction = {
        type: ProjectActionType.SET_CURRENT_PROJECT_USERS,
        payload: [],
      };

      const id = "unique";
      expect(
        projectReducer(
          { project: { id }, users: [newUser()] } as CurrentProjectState,
          action
        )
      ).toEqual({ project: { id }, users: [] });
    });
  });
});
