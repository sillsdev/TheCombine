import { projectReducer } from "../ProjectReducer";
import { Project, defaultProject } from "../../../types/project";
import { StoreAction, StoreActions } from "../../../rootActions";

describe("Project reducer tests", () => {
  it("returns default state when passed reset action", () => {
    const state: Project = {
      id: "1",
      name: "name",
      semanticDomains: [
        {
          name: "",
          number: ""
        }
      ],
      userRoles: "role",
      vernacularWritingSystem: "vernWritingSystem",
      analysisWritingSystems: [],
      characterSet: ["a", "b"],
      wordFields: ["fieldOne", "fieldTwo"],
      partsOfSpeech: ["a", "b"],
      words: [],
      customFields: []
    };

    const action: StoreAction = {
      type: StoreActions.RESET
    };

    expect(projectReducer(state, action)).toEqual({ ...defaultProject });
  });
});
