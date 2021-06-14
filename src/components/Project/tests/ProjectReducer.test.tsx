import { Project } from "api/models";
import { projectReducer } from "components/Project/ProjectReducer";
import { StoreAction, StoreActionTypes } from "rootActions";
import { newProject } from "types/project";

describe("Project reducer tests", () => {
  it("returns default state when passed reset action", () => {
    const action: StoreAction = {
      type: StoreActionTypes.RESET,
    };

    expect(projectReducer({} as Project, action)).toEqual(newProject());
  });
});
