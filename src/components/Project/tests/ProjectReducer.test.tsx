import { projectReducer } from "components/Project/ProjectReducer";
import { defaultProject, Project } from "types/project";
import { StoreAction, StoreActionTypes } from "rootActions";

describe("Project reducer tests", () => {
  it("returns default state when passed reset action", () => {
    const action: StoreAction = {
      type: StoreActionTypes.RESET,
    };

    expect(projectReducer({} as Project, action)).toEqual(defaultProject);
  });
});
