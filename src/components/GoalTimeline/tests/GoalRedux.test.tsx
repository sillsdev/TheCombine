import "@testing-library/jest-dom";
import { act, cleanup, screen } from "@testing-library/react";

import "tests/reactI18nextMock";
import { MergeUndoIds, Permission, User, UserEdit } from "api/models";
import * as LocalStorage from "backend/localStorage";
import GoalTimeline from "components/GoalTimeline";
import {
  asyncAddCompletedMergeToGoal,
  asyncAddGoal,
  asyncAdvanceStep,
  asyncGetUserEdits,
  asyncUpdateGoal,
  setCurrentGoal,
} from "components/GoalTimeline/Redux/GoalActions";
import {
  CharacterChange,
  CharacterStatus,
  CharInvChanges,
  CharInvData,
  CreateCharInv,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import {
  MergeDups,
  MergeDupsData,
  MergesCompleted,
} from "goals/MergeDuplicates/MergeDupsTypes";
import { goalDataMock } from "goals/MergeDuplicates/Redux/tests/MergeDupsDataMock";
import { setupStore } from "store";
import { Goal, GoalStatus, GoalType } from "types/goals";
import { Path } from "types/path";
import { newUser } from "types/user";
import * as goalUtilities from "utilities/goalUtilities";
import { renderWithProviders } from "utilities/test-utils";

jest.mock("backend", () => ({
  addGoalToUserEdit: (id: string, goal: Goal) =>
    mockAddGoalToUserEdit(id, goal),
  addStepToGoal: (
    id: string,
    goalIndex: number,
    step: string,
    stepIndex?: number
  ) => mockAddStepToGoal(id, goalIndex, step, stepIndex),
  createUserEdit: () => mockCreateUserEdit(),
  getCurrentPermissions: () => mockGetCurrentPermissions(),
  getDuplicates: () => mockGetDuplicates(),
  getUser: (id: string) => mockGetUser(id),
  getUserEditById: (id: string, index: string) =>
    mockGetUserEditById(id, index),
  updateUser: (user: User) => mockUpdateUser(user),
}));

jest.mock("browserRouter", () => ({
  navigate: (path: Path) => mockNavigate(path),
}));

const mockAddGoalToUserEdit = jest.fn();
const mockAddStepToGoal = jest.fn();
const mockCreateUserEdit = jest.fn();
const mockGetCurrentPermissions = jest.fn();
const mockGetDuplicates = jest.fn();
const mockGetUser = jest.fn();
const mockGetUserEditById = jest.fn();
const mockNavigate = jest.fn();
const mockUpdateUser = jest.fn();
function setMockFunctions() {
  mockAddGoalToUserEdit.mockResolvedValue(0);
  mockAddStepToGoal.mockResolvedValue(0);
  mockCreateUserEdit.mockResolvedValue(mockUser);
  mockGetCurrentPermissions.mockResolvedValue([
    Permission.CharacterInventory,
    Permission.MergeAndReviewEntries,
  ]);
  mockGetDuplicates.mockResolvedValue(goalDataMock.plannedWords);
  mockGetUser.mockResolvedValue(mockUser);
  mockGetUserEditById.mockResolvedValue(mockUserEdit);
  mockUpdateUser.mockResolvedValue(mockUser);
}

const mockProjectId = "123";
const mockUserEditId = "456";
const mockCompletedMerge: MergeUndoIds = {
  parentIds: ["1", "2"],
  childIds: ["3", "4"],
};
const mockCharInvChanges: CharacterChange[] = [
  ["'", CharacterStatus.Undecided, CharacterStatus.Accepted],
];
const mockUserEdit: UserEdit = {
  id: mockUserEditId,
  edits: [
    {
      guid: "edit-guid",
      goalType: 4,
      stepData: [],
      changes: JSON.stringify(mockCompletedMerge),
    },
  ],
  projectId: "",
};
const mockNoUserEdits: UserEdit = {
  id: mockUserEditId,
  edits: [],
  projectId: "",
};
const mockUserId = "789";
const mockUser = newUser("First Last", "username");
mockUser.id = mockUserId;
mockUser.workedProjects[mockProjectId] = mockUserEditId;

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

afterEach(cleanup);

describe("GoalTimeline", () => {
  it("renders Goal screen", async () => {
    await act(async () => {
      renderWithProviders(<GoalTimeline />);
    });
    // has the expected number of buttons
    const goalButtonList = screen.queryAllByRole("goal-button");
    // Expect 1 button for each of the Goal Types + one for the
    // "No History" element in the history list.
    expect(goalButtonList.length).toBe(4);
  });
});

describe("asyncGetUserEdits", () => {
  it("backend returns user edits", async () => {
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    const convertGoalToEditSpy = jest.spyOn(goalUtilities, "convertEditToGoal");
    LocalStorage.setCurrentUser(mockUser);
    LocalStorage.setProjectId(mockProjectId);
    await store.dispatch(asyncGetUserEdits());
    expect(store.getState().goalsState.history.length).toEqual(1);
    expect(convertGoalToEditSpy).toBeCalledTimes(1);
  });
  it("backend returns no user edits", async () => {
    // render the GoalTimeline
    LocalStorage.setCurrentUser(mockUser);
    LocalStorage.setProjectId(mockProjectId);
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });

    // setup mocks for testing the action/reducers
    jest.clearAllMocks();
    const convertGoalToEditSpy = jest.spyOn(goalUtilities, "convertEditToGoal");
    mockGetUserEditById.mockResolvedValueOnce(mockNoUserEdits);

    // dispatch the action
    await store.dispatch(asyncGetUserEdits());
    expect(store.getState().goalsState.history.length).toEqual(0);
    expect(convertGoalToEditSpy).toBeCalledTimes(0);
  });
});

describe("asyncAddCompletedMergeToGoal", () => {
  it("dispatch action", async () => {
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
      store.dispatch(setCurrentGoal(new MergeDups()));
      store.dispatch(asyncAddCompletedMergeToGoal(mockCompletedMerge));
    });
    const changes = store.getState().goalsState.currentGoal
      .changes as MergesCompleted;
    expect(changes.merges).toEqual([mockCompletedMerge]);
  });
});

describe("asyncAddGoal", () => {
  it("new MergeDups goal", async () => {
    LocalStorage.setCurrentUser(mockUser);
    LocalStorage.setProjectId("123");
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });

    const goal = new MergeDups();
    await act(async () => {
      store.dispatch(asyncAddGoal(goal));
    });
    // verify the new goal was loaded
    const currentGoal = store.getState().goalsState.currentGoal as MergeDups;
    expect(currentGoal.goalType).toEqual(GoalType.MergeDups);
    expect(currentGoal.status).toEqual(GoalStatus.InProgress);
    expect(currentGoal.numSteps).toEqual(8);
    expect(currentGoal.currentStep).toEqual(0);
    const goalData = currentGoal.data as MergeDupsData;
    expect(goalData).toEqual(goalDataMock);
    expect(mockNavigate).toHaveBeenCalledWith(Path.GoalCurrent);
  });
  it("new CreateCharInv goal", async () => {
    LocalStorage.setCurrentUser(mockUser);
    LocalStorage.setProjectId("123");
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });

    const goal = new CreateCharInv();
    await act(async () => {
      store.dispatch(asyncAddGoal(goal));
    });
    // verify the new goal was loaded
    const currentGoal = store.getState().goalsState
      .currentGoal as CreateCharInv;
    expect(currentGoal.goalType).toEqual(GoalType.CreateCharInv);
    expect(currentGoal.status).toEqual(GoalStatus.InProgress);
    expect(currentGoal.numSteps).toEqual(1);
    expect(currentGoal.currentStep).toEqual(0);
    const goalData = currentGoal.data as CharInvData;
    expect(goalData.inventory.length).toEqual(1);
    expect(goalData.inventory[0].length).toEqual(0);
    expect(mockNavigate).toHaveBeenCalledWith(Path.GoalCurrent);
  });
});
describe("asyncAdvanceStep", () => {
  it("advance MergeDups goal", async () => {
    // setup the test scenario
    LocalStorage.setCurrentUser(mockUser);
    LocalStorage.setProjectId("123");
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    // create mergeDups goal
    const goal = new MergeDups();
    await act(async () => {
      store.dispatch(asyncAddGoal(goal));
    });
    let currentGoal = store.getState().goalsState.currentGoal as MergeDups;
    expect(currentGoal.currentStep).toBe(0);
    expect(currentGoal.numSteps).toEqual(8);
    // iterate over all but the last step
    const numSteps = currentGoal.numSteps;
    for (var i = 0; i < numSteps - 1; i++) {
      // dispatch asyncAdvanceStep
      await act(async () => {
        store.dispatch(asyncAdvanceStep());
      });
      // verify current step is incremented each time
      currentGoal = store.getState().goalsState.currentGoal as MergeDups;
      expect(currentGoal.currentStep).toEqual(i + 1);
      // verify step is updated from the data
      // verify dispatchMergeStepData is called
    }
    // iterate past the last step
    await act(async () => {
      store.dispatch(asyncAdvanceStep());
    });
    expect(store.getState().goalsState.currentGoal.currentStep).toBe(7);
    expect(mockNavigate).toHaveBeenCalledWith(Path.GoalNext);
  });
  it("advance CreateCharInv goal", async () => {
    // setup the test scenario
    LocalStorage.setCurrentUser(mockUser);
    LocalStorage.setProjectId("123");
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    // create character inventory goal
    const goal = new CreateCharInv();
    await act(async () => {
      store.dispatch(asyncAddGoal(goal));
    });
    expect(store.getState().goalsState.currentGoal.numSteps).toBe(1);
    // iterate past the last step
    await act(async () => {
      store.dispatch(asyncAdvanceStep());
    });
    expect(store.getState().goalsState.currentGoal.currentStep).toBe(0);
    expect(mockNavigate).toHaveBeenCalledWith(Path.Goals);
  });
});
describe("asyncUpdateGoal", () => {
  it("update CreateCharInv goal", async () => {
    // setup the test scenario
    LocalStorage.setCurrentUser(mockUser);
    LocalStorage.setProjectId("123");
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    // create mergeDups goal
    const goal = new CreateCharInv();
    await act(async () => {
      store.dispatch(asyncAddGoal(goal));
    });
    //   - dispatch asyncUpdateGoal(new goal)
    const initialGoal = store.getState().goalsState
      .currentGoal as CreateCharInv;
    const updatedGoal = {
      ...initialGoal,
      changes: { charChanges: mockCharInvChanges },
    };
    await act(async () => {
      await store.dispatch(asyncUpdateGoal(updatedGoal));
    });
    // verify:
    //  - current value is now new goal
    expect(initialGoal === store.getState().goalsState.currentGoal).toBeFalsy();
    const changes = store.getState().goalsState.currentGoal
      .changes as CharInvChanges;
    expect(changes!.charChanges).toEqual(mockCharInvChanges);
    //  - backend is called to addGoalToUserEdit
    expect(mockAddGoalToUserEdit).toBeCalled();
  });
});
