import "@testing-library/jest-dom";
import { act, cleanup } from "@testing-library/react";

import { Edit, MergeUndoIds, Permission, User, UserEdit } from "api/models";
import * as LocalStorage from "backend/localStorage";
import GoalTimeline from "components/GoalTimeline";
import {
  CharInvChanges,
  CharInvData,
  CharacterStatus,
  CreateCharInv,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import {
  MergeDups,
  MergeDupsData,
  MergesCompleted,
  ReviewDeferredDups,
} from "goals/MergeDuplicates/MergeDupsTypes";
import { goalDataMock } from "goals/MergeDuplicates/Redux/tests/MergeDupsDataMock";
import {
  addCharInvChangesToGoal,
  addCompletedMergeToGoal,
  asyncAddGoal,
  asyncAdvanceStep,
  asyncGetUserEdits,
  asyncLoadNewGoalData,
  asyncUpdateGoal,
  setCurrentGoal,
} from "goals/Redux/GoalActions";
import { setupStore } from "rootRedux/store";
import { GoalStatus, GoalType } from "types/goals";
import { Path } from "types/path";
import { newUser } from "types/user";
import * as goalUtilities from "utilities/goalUtilities";
import { renderWithProviders } from "utilities/testingLibraryUtilities";

jest.mock("backend", () => ({
  addGoalToUserEdit: (...args: any[]) => mockAddGoalToUserEdit(...args),
  addStepToGoal: (...args: any[]) => mockAddStepToGoal(...args),
  createUserEdit: () => mockCreateUserEdit(),
  findDuplicates: () => Promise.resolve(),
  getCurrentPermissions: () => mockGetCurrentPermissions(),
  getGraylistEntries: (maxLists: number) => mockGetGraylistEntries(maxLists),
  getUser: (id: string) => mockGetUser(id),
  getUserEditById: (...args: any[]) => mockGetUserEditById(...args),
  retrieveDuplicates: () => mockRetrieveDuplicates(),
  updateUser: (user: User) => mockUpdateUser(user),
}));
jest.mock("components/Project/ProjectActions", () => ({}));
jest.mock("components/Pronunciations/Recorder");
jest.mock("router/browserRouter", () => ({
  navigate: (path: Path) => mockNavigate(path),
}));

const mockAddGoalToUserEdit = jest.fn();
const mockAddStepToGoal = jest.fn();
const mockCreateUserEdit = jest.fn();
const mockGetCurrentPermissions = jest.fn();
const mockGetGraylistEntries = jest.fn();
const mockGetUser = jest.fn();
const mockGetUserEditById = jest.fn();
const mockNavigate = jest.fn();
const mockRetrieveDuplicates = jest.fn();
const mockUpdateUser = jest.fn();
function setMockFunctions(): void {
  mockAddGoalToUserEdit.mockResolvedValue(0);
  mockAddStepToGoal.mockResolvedValue(0);
  mockCreateUserEdit.mockResolvedValue(mockUser());
  mockGetCurrentPermissions.mockResolvedValue([
    Permission.CharacterInventory,
    Permission.MergeAndReviewEntries,
  ]);
  mockGetGraylistEntries.mockResolvedValue([]);
  mockGetUser.mockResolvedValue(mockUser());
  mockGetUserEditById.mockResolvedValue(mockUserEdit(true));
  mockRetrieveDuplicates.mockResolvedValue(goalDataMock.plannedWords);
  mockUpdateUser.mockResolvedValue(mockUser());
}

const mockProjectId = "123";
const mockUserEditId = "456";
const mockUserId = "789";
const mockCompletedMerge: MergeUndoIds = {
  parentIds: ["1", "2"],
  childIds: ["3", "4"],
};
const mockCharInvChanges: CharInvChanges = {
  charChanges: [["'", CharacterStatus.Undecided, CharacterStatus.Accepted]],
  wordChanges: [{ find: "Q", replace: "q", words: { ["id-a"]: "id-b" } }],
};

const mockEdit = (): Edit => ({
  changes: JSON.stringify(mockCompletedMerge),
  goalType: 4,
  guid: "edit-guid",
  stepData: [],
});
const mockUserEdit = (hasEdit: boolean): UserEdit => ({
  edits: hasEdit ? [mockEdit()] : [],
  id: mockUserEditId,
  projectId: mockProjectId,
});
const mockUser = (): User => ({
  ...newUser("First Last", "username"),
  id: mockUserId,
  workedProjects: { [mockProjectId]: mockUserEditId },
});

function setupLocalStorage(): void {
  LocalStorage.setCurrentUser(mockUser());
  LocalStorage.setProjectId(mockProjectId);
}

beforeEach(() => {
  // Restore any spied functions before clearing all
  jest.restoreAllMocks();
  jest.clearAllMocks();
  setMockFunctions();
  setupLocalStorage();
});

afterEach(cleanup);

describe("setCurrentGoal", () => {
  it("calls setCurrentGoal() with no arguments", async () => {
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
      store.dispatch(setCurrentGoal());
    });
    expect(store.getState().goalsState.currentGoal.goalType).toEqual(
      GoalType.Default
    );
  });
});

describe("asyncGetUserEdits", () => {
  it("backend returns user edits", async () => {
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    const convertEditToGoalSpy = jest.spyOn(goalUtilities, "convertEditToGoal");
    await act(async () => {
      await store.dispatch(asyncGetUserEdits());
    });
    expect(store.getState().goalsState.history).toHaveLength(1);
    expect(convertEditToGoalSpy).toHaveBeenCalledTimes(1);
  });

  it("backend returns no user edits", async () => {
    // render the GoalTimeline
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });

    // setup mocks for testing the action/reducers
    jest.clearAllMocks();
    const convertEditToGoalSpy = jest.spyOn(goalUtilities, "convertEditToGoal");
    mockGetUserEditById.mockResolvedValueOnce(mockUserEdit(false));

    // dispatch the action
    await act(async () => {
      await store.dispatch(asyncGetUserEdits());
    });
    expect(store.getState().goalsState.history).toHaveLength(0);
    expect(convertEditToGoalSpy).toHaveBeenCalledTimes(0);
  });

  it("creates new user edits", async () => {
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    LocalStorage.setCurrentUser(newUser());
    await act(async () => {
      await store.dispatch(asyncGetUserEdits());
    });
    expect(store.getState().goalsState.history).toHaveLength(0);
    expect(mockCreateUserEdit).toHaveBeenCalledTimes(1);
  });
});

describe("asyncAddGoal", () => {
  it("adds new MergeDups goal", async () => {
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });

    await act(async () => {
      await store.dispatch(asyncAddGoal(new MergeDups()));
    });
    // verify the new goal was loaded but its data was not loaded
    const currentGoal = store.getState().goalsState.currentGoal as MergeDups;
    expect(currentGoal.goalType).toEqual(GoalType.MergeDups);
    expect(currentGoal.status).toEqual(GoalStatus.Loading);
    expect((currentGoal.data as MergeDupsData).plannedWords).toEqual([[]]);
    expect(mockNavigate).toHaveBeenCalledWith(Path.GoalCurrent);
  });

  it("adds new CreateCharInv goal", async () => {
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });

    await act(async () => {
      await store.dispatch(asyncAddGoal(new CreateCharInv()));
    });
    // verify the new goal was loaded
    const currentGoal = store.getState().goalsState
      .currentGoal as CreateCharInv;
    expect(currentGoal.goalType).toEqual(GoalType.CreateCharInv);
    expect(currentGoal.status).toEqual(GoalStatus.InProgress);
    expect(currentGoal.numSteps).toEqual(1);
    expect(currentGoal.currentStep).toEqual(0);
    const goalData = currentGoal.data as CharInvData;
    expect(goalData.inventory).toHaveLength(1);
    expect(goalData.inventory[0]).toHaveLength(0);
    expect(mockNavigate).toHaveBeenCalledWith(Path.GoalCurrent);
  });
});

describe("asyncLoadNewGoalData", () => {
  it("loads data for MergeDups goal", async () => {
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });

    await act(async () => {
      await store.dispatch(asyncAddGoal(new MergeDups()));
      await store.dispatch(asyncLoadNewGoalData());
    });
    // verify the goal data was loaded
    const currentGoal = store.getState().goalsState.currentGoal as MergeDups;
    expect(currentGoal.goalType).toEqual(GoalType.MergeDups);
    expect(currentGoal.status).toEqual(GoalStatus.InProgress);
    expect(currentGoal.numSteps).toEqual(8);
    expect(currentGoal.currentStep).toEqual(0);
    expect(currentGoal.data as MergeDupsData).toEqual(goalDataMock);
  });
});

describe("asyncAdvanceStep", () => {
  it("advance MergeDups goal", async () => {
    // setup the test scenario
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    // create mergeDups goal
    await act(async () => {
      await store.dispatch(asyncAddGoal(new MergeDups()));
      await store.dispatch(asyncLoadNewGoalData());
    });
    let currentGoal = store.getState().goalsState.currentGoal as MergeDups;
    expect(currentGoal.currentStep).toBe(0);
    expect(currentGoal.numSteps).toEqual(8);
    // iterate over all but the last step
    const numSteps = currentGoal.numSteps;
    for (let i = 0; i < numSteps - 1; i++) {
      // dispatch asyncAdvanceStep
      await act(async () => {
        await store.dispatch(asyncAdvanceStep());
      });
      // verify current step is incremented each time
      currentGoal = store.getState().goalsState.currentGoal as MergeDups;
      expect(currentGoal.currentStep).toEqual(i + 1);
      // verify step is updated from the data
      expect(currentGoal.steps).toHaveLength(i + 2);
    }
    // iterate past the last step
    await act(async () => {
      await store.dispatch(asyncAdvanceStep());
    });
    expect(store.getState().goalsState.currentGoal.currentStep).toBe(7);
    expect(mockNavigate).toHaveBeenCalledWith(Path.GoalNext);
  });

  it("advance CreateCharInv goal", async () => {
    // setup the test scenario
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    // create character inventory goal
    const goal = new CreateCharInv();
    await act(async () => {
      await store.dispatch(asyncAddGoal(goal));
    });
    expect(store.getState().goalsState.currentGoal.numSteps).toBe(1);
    // iterate past the last step
    await act(async () => {
      await store.dispatch(asyncAdvanceStep());
    });
    expect(store.getState().goalsState.currentGoal.currentStep).toBe(0);
    expect(mockNavigate).toHaveBeenCalledWith(Path.Goals);
  });
});

describe("asyncUpdateGoal", () => {
  it("update CreateCharInv goal", async () => {
    // setup the test scenario
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    // create CreateCharInv goal
    const goal = new CreateCharInv();
    await act(async () => {
      await store.dispatch(asyncAddGoal(goal));
      store.dispatch(addCharInvChangesToGoal(mockCharInvChanges));
    });
    const changes = store.getState().goalsState.currentGoal.changes;
    expect(changes).toBe(mockCharInvChanges);
    // dispatch asyncUpdateGoal()
    await act(async () => {
      await store.dispatch(asyncUpdateGoal());
    });
    // verify:
    //  - backend is called to addGoalToUserEdit
    expect(mockAddGoalToUserEdit).toHaveBeenCalled();
  });

  it("update MergeDups goal", async () => {
    // setup the test scenario
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    // create MergeDups goal
    const goal = new MergeDups();
    await act(async () => {
      await store.dispatch(asyncAddGoal(goal));
    });
    // dispatch asyncUpdateGoal()
    await act(async () => {
      store.dispatch(addCompletedMergeToGoal(mockCompletedMerge));
      await store.dispatch(asyncUpdateGoal());
    });
    // verify:
    //  - current value is now new goal
    const changes = store.getState().goalsState.currentGoal
      .changes as MergesCompleted;
    expect(changes.merges).toEqual([mockCompletedMerge]);
    //  - backend is called to addGoalToUserEdit
    expect(mockAddGoalToUserEdit).toHaveBeenCalled();
  });

  it("update ReviewDeferredDups goal", async () => {
    // setup the test scenario
    const store = setupStore();
    await act(async () => {
      renderWithProviders(<GoalTimeline />, { store: store });
    });
    // create ReviewDeferredDups goal
    const goal = new ReviewDeferredDups();
    await act(async () => {
      await store.dispatch(asyncAddGoal(goal));
    });
    // dispatch asyncUpdateGoal()
    await act(async () => {
      store.dispatch(addCompletedMergeToGoal(mockCompletedMerge));
      await store.dispatch(asyncUpdateGoal());
    });
    // verify:
    //  - current value is now new goal
    const changes = store.getState().goalsState.currentGoal
      .changes as MergesCompleted;
    expect(changes.merges).toEqual([mockCompletedMerge]);
    //  - backend is called to addGoalToUserEdit
    expect(mockAddGoalToUserEdit).toHaveBeenCalled();
  });
});
