import { Action } from "redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { Project } from "api/models";
import { updateProject } from "backend";
import { ProjectActionType } from "components/Project/ProjectReduxTypes";
import {
  CharacterStatus,
  CharacterChange,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import * as Actions from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import { defaultState } from "goals/CharacterInventory/Redux/CharacterInventoryReducer";
import {
  CharacterInventoryState,
  CharacterSetEntry,
  CharacterInventoryType,
  newCharacterSetEntry,
} from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import { StoreState } from "types";
import { newProject } from "types/project";
import { newUser } from "types/user";

const VALID_DATA: string[] = ["a", "b"];
const REJECT_DATA: string[] = ["y", "z"];
const CHARACTER_SET_DATA: CharacterSetEntry[] = [
  { ...newCharacterSetEntry("a"), status: CharacterStatus.Accepted },
  { ...newCharacterSetEntry("b"), status: CharacterStatus.Accepted },
  { ...newCharacterSetEntry("y"), status: CharacterStatus.Rejected },
  { ...newCharacterSetEntry("z"), status: CharacterStatus.Rejected },
  { ...newCharacterSetEntry("m"), status: CharacterStatus.Undecided },
];

const characterInventoryState: Partial<CharacterInventoryState> = {
  characterSet: CHARACTER_SET_DATA,
  rejectedCharacters: REJECT_DATA,
  validCharacters: VALID_DATA,
};
const project: Partial<Project> = {
  rejectedCharacters: [],
  validCharacters: [],
};
const MOCK_STATE = {
  characterInventoryState,
  currentProjectState: { project },
  goalsState: { currentGoal: { changes: {} } },
};

const mockProjectId = "123";
const mockUserEditId = "456";
const mockUserId = "789";
const mockUser = newUser();
mockUser.id = mockUserId;
mockUser.workedProjects[mockProjectId] = mockUserEditId;

jest.mock("backend");
jest.mock("browserRouter");
jest.mock("components/GoalTimeline/Redux/GoalActions", () => ({
  asyncUpdateGoal: (...args: any[]) => mockAsyncUpdateGoal(...args),
}));
const mockAsyncUpdateGoal = jest.fn();

const createMockStore = configureMockStore([thunk]);

beforeEach(() => {
  jest.resetAllMocks();
});

describe("CharacterInventoryActions", () => {
  test("setInventory yields correct action", () => {
    expect(Actions.setValidCharacters(VALID_DATA)).toEqual({
      type: CharacterInventoryType.SET_VALID_CHARACTERS,
      payload: VALID_DATA,
    });
  });

  test("uploadInventory dispatches correct action", async () => {
    // Mock out the goal-related things called by uploadInventory.
    const mockAction: Action = { type: null };
    mockAsyncUpdateGoal.mockReturnValue(mockAction);

    const mockStore = createMockStore(MOCK_STATE);
    const mockUpload = Actions.uploadInventory();
    await mockUpload(
      mockStore.dispatch,
      mockStore.getState as () => StoreState,
    );
    expect(updateProject).toHaveBeenCalledTimes(1);
    expect(mockStore.getActions()).toContainEqual({
      type: ProjectActionType.SET_CURRENT_PROJECT,
      payload: project,
    });
  });

  test("getChanges returns correct changes", () => {
    const accAcc = "accepted";
    const accRej = "accepted->rejected";
    const accUnd = "accepted->undecided";
    const rejAcc = "rejected->accepted";
    const rejRej = "rejected";
    const rejUnd = "rejected->undecided";
    const undAcc = "undecided->accepted";
    const undRej = "undecided->rejected";
    const oldProj = {
      ...newProject(),
      validCharacters: [accAcc, accRej, accUnd],
      rejectedCharacters: [rejAcc, rejRej, rejUnd],
    };
    const charInvState: CharacterInventoryState = {
      ...defaultState,
      validCharacters: [accAcc, rejAcc, undAcc],
      rejectedCharacters: [accRej, rejRej, undRej],
    };
    const expectedChanges: CharacterChange[] = [
      [accRej, CharacterStatus.Accepted, CharacterStatus.Rejected],
      [accUnd, CharacterStatus.Accepted, CharacterStatus.Undecided],
      [rejAcc, CharacterStatus.Rejected, CharacterStatus.Accepted],
      [rejUnd, CharacterStatus.Rejected, CharacterStatus.Undecided],
      [undAcc, CharacterStatus.Undecided, CharacterStatus.Accepted],
      [undRej, CharacterStatus.Undecided, CharacterStatus.Rejected],
    ];
    const changes = Actions.getChanges(oldProj, charInvState);
    expect(changes.length).toEqual(expectedChanges.length);
    expectedChanges.forEach((ch) => expect(changes).toContainEqual(ch));
  });
});
