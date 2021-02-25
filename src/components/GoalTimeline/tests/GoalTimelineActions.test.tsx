import { Action } from "redux";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunk from "redux-thunk";

import * as LocalStorage from "backend/localStorage";
import { defaultState } from "components/GoalTimeline/DefaultState";
import * as actions from "components/GoalTimeline/GoalsActions";
import { CreateCharInv } from "goals/CreateCharInv/CreateCharInv";
import { HandleFlags } from "goals/HandleFlags/HandleFlags";
import {
  MergeDupData,
  MergeDups,
  MergeStepData,
} from "goals/MergeDupGoal/MergeDups";
import { goalDataMock } from "goals/MergeDupGoal/MergeDupStep/tests/MockMergeDupData";
import { Goal } from "types/goals";
import { maxNumSteps } from "types/goalUtilities";
import { User } from "types/user";
import { UserEdit } from "types/userEdit";

jest.mock("goals/MergeDupGoal/MergeDupStep/MergeDupStepActions", () => {
  const realMergeDupActions = jest.requireActual(
    "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions"
  );
  return {
    ...realMergeDupActions,
    dispatchMergeStepData: (goal: MergeDups) => mockDispatchMergeStepData(goal),
    loadMergeDupsData: (goal: MergeDups) => mockLoadMergeDupsData(goal),
  };
});

jest.mock("backend", () => {
  return {
    addGoalToUserEdit: (id: string, goal: Goal) =>
      mockAddGoalToUserEdit(id, goal),
    addStepToGoal: (
      id: string,
      goalIndex: number,
      step: string,
      stepIndex?: number
    ) => mockAddStepToGoal(id, goalIndex, step, stepIndex),
    createUserEdit: () => mockCreateUserEdit(),
    getUser: (id: string) => mockGetUser(id),
    getUserEditById: (id: string, index: string) =>
      mockGetUserEditById(id, index),
    updateUser: (user: User) => mockUpdateUser(user),
  };
});

const mockAddGoalToUserEdit = jest.fn();
const mockAddStepToGoal = jest.fn();
const mockCreateUserEdit = jest.fn();
const mockDispatchMergeStepData = jest.fn();
const mockGetUser = jest.fn();
const mockGetUserEditById = jest.fn();
const mockLoadMergeDupsData = jest.fn();
const mockUpdateUser = jest.fn();
function setMockFunctions() {
  mockAddGoalToUserEdit.mockResolvedValue(0);
  mockAddStepToGoal.mockResolvedValue(0);
  mockCreateUserEdit.mockResolvedValue(mockUser);
  mockDispatchMergeStepData.mockReturnValue(mockAction);
  mockGetUser.mockResolvedValue(mockUser);
  mockGetUserEditById.mockResolvedValue(mockUserEdit);
  mockLoadMergeDupsData.mockImplementation((goal: MergeDups) =>
    Promise.resolve(goal)
  );
  mockUpdateUser.mockResolvedValue(mockUser);
}

// At compile time, jest.mock calls will be hoisted to the top of the file,
// so calls to imported variables fail. Fixed by initializing these variables
// inside of beforeAll() or beforeEach()
const createMockStore = configureMockStore([thunk]);
let mockStore: MockStoreEnhanced<unknown, {}>;
let oldProjectId: string;
let oldUser: User | undefined;

const mockAction: Action = { type: null };
const mockProjectId = "123";
const mockUserEditId = "456";
const mockUserEdit: UserEdit = { id: mockUserEditId, edits: [] };
const mockUserId = "789";
let mockUser = new User("", "", "");
mockUser.id = mockUserId;
mockUser.workedProjects[mockProjectId] = mockUserEditId;

beforeAll(() => {
  // Save things in localStorage to restore once tests are done
  oldProjectId = LocalStorage.getProjectId();
  oldUser = LocalStorage.getCurrentUser();

  const mockStoreState = {
    goalsState: {
      historyState: {
        history: [...defaultState.historyState.history],
      },
      allPossibleGoals: [...defaultState.allPossibleGoals],
      suggestionsState: {
        suggestions: [...defaultState.suggestionsState.suggestions],
      },
    },
  };

  mockStore = createMockStore(mockStoreState);
});

beforeEach(() => {
  // Clear everything from localStorage interacted with by these tests.
  LocalStorage.remove(LocalStorage.LocalStorageKey.ProjectId);
  LocalStorage.setCurrentUser(mockUser);

  jest.resetAllMocks();
  setMockFunctions();
});

afterEach(() => {
  mockStore.clearActions();
});

afterAll(() => {
  LocalStorage.setProjectId(oldProjectId);
  if (oldUser) {
    LocalStorage.setCurrentUser(oldUser);
  }
});

describe("GoalsActions", () => {
  it("AddGoalToHistoryAction should create an action to add a goal to history", () => {
    const goal: Goal = new CreateCharInv();
    const expectedAction: actions.AddGoalToHistoryAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
      payload: goal,
    };
    expect(actions.addGoalToHistory(goal)).toEqual(expectedAction);
  });

  it("LoadUserEditsAction should create an action to load user edits", () => {
    const goalHistory: Goal[] = [new CreateCharInv(), new MergeDups()];
    const expectedAction: actions.LoadUserEditsAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: goalHistory,
    };
    expect(actions.loadUserEdits(goalHistory)).toEqual(expectedAction);
  });

  it("UpdateGoalAction should create an action to update a goal", () => {
    const goal: Goal = new CreateCharInv();
    const expectedAction: actions.UpdateGoalAction = {
      type: actions.GoalsActions.UPDATE_GOAL,
      payload: goal,
    };
    expect(actions.updateGoal(goal)).toEqual(expectedAction);
  });

  it("asyncLoadExistingUserEdits should create an async action to load user edits", async () => {
    await mockStore.dispatch<any>(
      actions.asyncLoadExistingUserEdits(mockProjectId, mockUserEditId)
    );
    const loadUserEdits: actions.LoadUserEditsAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: [],
    };
    expect(mockStore.getActions()).toEqual([loadUserEdits]);
  });

  describe("asyncGetUserEdits", () => {
    it("should dispatch an action to load a user edit", async () => {
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);
      await mockStore.dispatch<any>(actions.asyncGetUserEdits());
      const loadUserEditsAction: actions.LoadUserEditsAction = {
        type: actions.GoalsActions.LOAD_USER_EDITS,
        payload: [],
      };
      expect(mockStore.getActions()).toEqual([loadUserEditsAction]);
    });

    it("should not dispatch any actions when creating a new user edit", async () => {
      LocalStorage.setCurrentUser(mockUser);
      await mockStore.dispatch<any>(actions.asyncGetUserEdits());
      expect(mockStore.getActions()).toEqual([]);
    });
  });

  describe("asyncAddGoalToHistory", () => {
    beforeEach(() => {
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);
    });

    it("should create an async action and make backend calls", async () => {
      const goal: Goal = new CreateCharInv();
      await mockStore.dispatch<any>(actions.asyncAddGoalToHistory(goal));
      const addGoalToHistory: actions.AddGoalToHistoryAction = {
        type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
        payload: goal,
      };
      expect(mockStore.getActions()).toEqual([addGoalToHistory]);
      expect(mockAddGoalToUserEdit).toBeCalledTimes(1);
      expect(mockAddStepToGoal).toBeCalledTimes(1);
    });

    it("should call MergeDups functions when goal is MergeDups", async () => {
      const goal: Goal = new MergeDups();
      goal.numSteps = maxNumSteps(goal.goalType);
      goal.steps = [
        {
          words: [...goalDataMock.plannedWords[0]],
        },
      ];
      await mockStore.dispatch<any>(actions.asyncAddGoalToHistory(goal));
      expect(mockDispatchMergeStepData).toBeCalledTimes(1);
      expect(mockLoadMergeDupsData).toBeCalledTimes(1);
    });
  });

  describe("asyncAdvanceStep", () => {
    beforeEach(() => {
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);
    });

    it("should increase current step and dispatch a goal update", async () => {
      const goal = new Goal();
      expect(goal.currentStep).toEqual(0);
      const mockStoreState = {
        goalsState: {
          historyState: {
            history: [goal],
          },
        },
      };
      mockStore = createMockStore(mockStoreState);
      await mockStore.dispatch<any>(actions.asyncAdvanceStep());
      expect(goal.currentStep).toEqual(1);
      expect(mockStore.getActions()[0].type).toEqual(
        actions.GoalsActions.UPDATE_GOAL
      );
    });

    it("should make backend call if goal unfinished", async () => {
      const goal = new Goal();
      goal.numSteps = 2;
      expect(goal.currentStep + 1).toBeLessThan(goal.numSteps);
      const mockStoreState = {
        goalsState: {
          historyState: {
            history: [goal],
          },
        },
      };
      mockStore = createMockStore(mockStoreState);
      await mockStore.dispatch<any>(actions.asyncAdvanceStep());
      expect(mockAddStepToGoal).toBeCalledTimes(1);
    });

    it("should not make backend call if goal finished", async () => {
      const goal = new Goal();
      expect(goal.currentStep + 1).toEqual(goal.numSteps);
      const mockStoreState = {
        goalsState: {
          historyState: {
            history: [goal],
          },
        },
      };
      mockStore = createMockStore(mockStoreState);
      await mockStore.dispatch<any>(actions.asyncAdvanceStep());
      expect(mockAddStepToGoal).toBeCalledTimes(0);
    });

    it("should create MergeDups action when goal is unfinished MergeDups", async () => {
      const goal = new MergeDups();
      goal.numSteps = 2;
      const mockStoreState = {
        goalsState: {
          historyState: {
            history: [goal],
          },
        },
      };
      mockStore = createMockStore(mockStoreState);
      await mockStore.dispatch<any>(actions.asyncAdvanceStep());
      expect(mockDispatchMergeStepData).toBeCalledTimes(1);
    });
  });

  describe("dispatchStepData", () => {
    it("should not create any action for an unimplemented goal", async () => {
      const goal: Goal = new HandleFlags();
      await mockStore.dispatch<any>(actions.dispatchStepData(goal));
      expect(mockStore.getActions()).toEqual([]);
    });

    it("should create an action to add MergeDups data", async () => {
      const goal: Goal = new MergeDups();
      goal.numSteps = maxNumSteps(goal.goalType);
      goal.steps = [
        {
          words: [...goalDataMock.plannedWords[0]],
        },
      ];
      await mockStore.dispatch<any>(actions.dispatchStepData(goal));
      expect(mockDispatchMergeStepData).toBeCalledTimes(1);
    });
  });

  describe("loadGoalData", () => {
    it("should load MergeDups data", async () => {
      const goal = new MergeDups();
      await actions.loadGoalData(goal);
      expect(mockLoadMergeDupsData).toBeCalledTimes(1);
    });

    it("should not load data for an unimplemented goal", async () => {
      const goal = new HandleFlags();
      expect(await actions.loadGoalData(goal)).toEqual(goal);
    });
  });

  describe("updateStepFromData", () => {
    it("should update the step data of a goal", () => {
      const goal = new MergeDups();
      goal.data = goalDataMock;
      expect(goal.steps).toEqual([]);
      expect(goal.currentStep).toEqual(0);

      const updatedGoal = actions.updateStepFromData(goal);
      expect((updatedGoal.steps[0] as MergeStepData).words).toEqual(
        (goal.data as MergeDupData).plannedWords[0]
      );
      expect(updatedGoal.currentStep).toEqual(0);
    });

    it("should not update the step data of an unimplemented goal", () => {
      const goal = new HandleFlags();
      expect(actions.updateStepFromData(goal)).toEqual(goal);
    });
  });

  describe("getUserEditId", () => {
    it("should return a userEditId", () => {
      LocalStorage.setProjectId(mockProjectId);
      expect(actions.getUserEditId()).toEqual(mockUserEditId);
    });

    it("should return undefined when no projectId is set", () => {
      expect(actions.getUserEditId()).toEqual(undefined);
    });

    it("should return undefined when no userEditId exists for the project", () => {
      LocalStorage.setProjectId("differentThanMockProjectId");
      expect(actions.getUserEditId()).toEqual(undefined);
    });
  });
});
