import { projectReducer } from "components/Project/ProjectReducer";
import { Project, defaultProject } from "types/project";
import { StoreAction, StoreActions } from "rootActions";

describe("Project reducer tests", () => {
  it("returns default state when passed reset action", () => {
    const action: StoreAction = {
      type: StoreActions.RESET,
    };

    expect(projectReducer({} as Project, action)).toEqual({
      ...defaultProject,
    });
  });
});
