import { Action } from "redux";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunk from "redux-thunk";

import { User, UserEdit } from "api/models";
import * as LocalStorage from "backend/localStorage";
import { defaultState } from "components/GoalTimeline/DefaultState";
import * as actions from "components/GoalTimeline/Redux/GoalActions";
import {
  GoalActionTypes,
  LoadUserEditsAction,
  SetCurrentGoalAction,
} from "components/GoalTimeline/Redux/GoalReduxTypes";
import { CreateCharInv } from "goals/CreateCharInv/CreateCharInv";
import { HandleFlags } from "goals/HandleFlags/HandleFlags";
import { MergeDups } from "goals/MergeDupGoal/MergeDups";
import { MergeDupData, MergeStepData } from "goals/MergeDupGoal/MergeDupsTypes";
import { goalDataMock } from "goals/MergeDupGoal/Redux/tests/MockMergeDupData";
import { Goal, GoalsState } from "types/goals";
import { maxNumSteps } from "types/goalUtilities";
import { newUser } from "types/user";

jest.mock("goals/MergeDupGoal/Redux/MergeDupActions", () => {
  const realMergeDupActions = jest.requireActual(
    "goals/MergeDupGoal/Redux/MergeDupActions"
  );
  return {
    ...realMergeDupActions,
    dispatchMergeStepData: (goal: MergeDups) => mockDispatchMergeStepData(goal),
    loadMergeDupsData: (goal: MergeDups) => mockLoadMergeDupsData(goal),
  };
});

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
  getUser: (id: string) => mockGetUser(id),
  getUserEditById: (id: string, index: string) =>
    mockGetUserEditById(id, index),
  updateUser: (user: User) => mockUpdateUser(user),
}));

// mock the track method of segment analytics
global.analytics = { track: jest.fn() } as any;

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
const mockUserEdit: UserEdit = { id: mockUserEditId, edits: [], projectId: "" };
const mockUserId = "789";
const mockUser = newUser();
mockUser.id = mockUserId;
mockUser.workedProjects[mockProjectId] = mockUserEditId;

beforeAll(() => {
  // Save things in localStorage to restore once tests are done
  oldProjectId = LocalStorage.getProjectId();
  oldUser = LocalStorage.getCurrentUser();

  const mockStoreState: { goalsState: GoalsState } = {
    goalsState: {
      allGoalTypes: [...defaultState.allGoalTypes],
      currentGoal: new Goal(),
      goalTypeSuggestions: [...defaultState.goalTypeSuggestions],
      history: [...defaultState.history],
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

describe("GoalActions", () => {
  describe("action creators", () => {
    it("loadUserEdits should create an action to load user edits", () => {
      const goalHistory: Goal[] = [new CreateCharInv(), new MergeDups()];
      const expectedAction: LoadUserEditsAction = {
        type: GoalActionTypes.LOAD_USER_EDITS,
        payload: goalHistory,
      };
      expect(actions.loadUserEdits(goalHistory)).toEqual(expectedAction);
    });

    it("setCurrentGoal should create an action to set the current goal", () => {
      const goal = new Goal();
      const expectedAction: SetCurrentGoalAction = {
        type: GoalActionTypes.SET_CURRENT_GOAL,
        payload: goal,
      };
      expect(actions.setCurrentGoal(goal)).toEqual(expectedAction);
    });
  });

  it("asyncLoadExistingUserEdits should create an async action to load user edits", async () => {
    await mockStore.dispatch<any>(
      actions.asyncLoadExistingUserEdits(mockProjectId, mockUserEditId)
    );
    const loadUserEdits: LoadUserEditsAction = {
      type: GoalActionTypes.LOAD_USER_EDITS,
      payload: [],
    };
    expect(mockStore.getActions()).toEqual([loadUserEdits]);
  });

  describe("asyncGetUserEdits", () => {
    it("should dispatch an action to load a user edit", async () => {
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);
      await mockStore.dispatch<any>(actions.asyncGetUserEdits());
      const loadUserEditsAction: LoadUserEditsAction = {
        type: GoalActionTypes.LOAD_USER_EDITS,
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

  describe("asyncAddGoal", () => {
    beforeEach(() => {
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);
    });

    it("should make appropriate dispatch and backend call", async () => {
      const goal: Goal = new CreateCharInv();
      await mockStore.dispatch<any>(actions.asyncAddGoal(goal));
      const addGoal: SetCurrentGoalAction = {
        type: GoalActionTypes.SET_CURRENT_GOAL,
        payload: goal,
      };
      expect(mockStore.getActions()).toContainEqual(addGoal);
      expect(mockAddGoalToUserEdit).toBeCalledTimes(1);
    });
  });

  describe("asyncLoadNewGoal", () => {
    beforeEach(() => {
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);
    });

    it("should create an action, but nothing else if no step data to load", async () => {
      const goal: Goal = new CreateCharInv();
      goal.index = 0;
      await mockStore.dispatch<any>(
        actions.asyncLoadNewGoal(goal, mockUserEditId)
      );
      expect(mockStore.getActions()[0].type).toEqual(
        GoalActionTypes.SET_CURRENT_GOAL
      );
      expect(mockAddGoalToUserEdit).toBeCalledTimes(0);
      expect(mockAddStepToGoal).toBeCalledTimes(0);
    });

    it("should call MergeDups functions when goal is MergeDups", async () => {
      const goal: Goal = new MergeDups();
      goal.index = 0;
      goal.numSteps = maxNumSteps(goal.goalType);
      goal.steps = [
        {
          words: [...goalDataMock.plannedWords[0]],
        },
      ];
      await mockStore.dispatch<any>(
        actions.asyncLoadNewGoal(goal, mockUserEditId)
      );
      expect(mockDispatchMergeStepData).toBeCalledTimes(1);
      expect(mockLoadMergeDupsData).toBeCalledTimes(1);
    });
  });

  describe("asyncAdvanceStep", () => {
    beforeEach(() => {
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);
    });

    function setMockGoalState(goal: Goal) {
      const mockStoreState = {
        goalsState: {
          currentGoal: goal,
          history: [goal],
        },
      };
      mockStore = createMockStore(mockStoreState);
    }

    it("should increase current step", async () => {
      const goal = new Goal();
      goal.numSteps = 2;
      expect(goal.currentStep).toEqual(0);
      setMockGoalState(goal);
      await mockStore.dispatch<any>(actions.asyncAdvanceStep());
      expect(goal.currentStep).toEqual(1);
    });

    it("should make dispatch and backend call if goal unfinished", async () => {
      const goal = new Goal();
      goal.numSteps = 2;
      expect(goal.currentStep + 1).toBeLessThan(goal.numSteps);
      setMockGoalState(goal);
      await mockStore.dispatch<any>(actions.asyncAdvanceStep());
      expect(mockAddStepToGoal).toBeCalledTimes(1);
      expect(mockStore.getActions()[0].type).toEqual(
        GoalActionTypes.SET_CURRENT_GOAL
      );
    });

    it("should not make dispatch nor backend call if goal finished", async () => {
      const goal = new Goal();
      expect(goal.currentStep + 1).toEqual(goal.numSteps);
      setMockGoalState(goal);
      await mockStore.dispatch<any>(actions.asyncAdvanceStep());
      expect(mockAddStepToGoal).toBeCalledTimes(0);
      expect(mockStore.getActions().length).toEqual(0);
    });

    it("should create MergeDups action when goal is unfinished MergeDups", async () => {
      const goal = new MergeDups();
      goal.numSteps = 2;
      setMockGoalState(goal);
      await mockStore.dispatch<any>(actions.asyncAdvanceStep());
      expect(mockDispatchMergeStepData).toBeCalledTimes(1);
    });
  });

  describe("asyncUpdateGoal", () => {
    beforeEach(() => {
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);
    });

    it("should update in state with a dispatch and in the backend", async () => {
      const goal: Goal = new MergeDups();
      await mockStore.dispatch<any>(actions.asyncUpdateGoal(goal));
      expect(mockStore.getActions().length).toEqual(1);
      expect(mockStore.getActions()[0].type).toEqual(
        GoalActionTypes.SET_CURRENT_GOAL
      );
      expect(mockAddGoalToUserEdit).toBeCalledTimes(1);
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
      expect(await actions.loadGoalData(goal)).toEqual(false);
    });
  });

  describe("updateStepFromData", () => {
    it("should update the step data of a goal", () => {
      const goal = new MergeDups();
      goal.data = goalDataMock;
      expect(goal.steps).toEqual([]);
      expect(goal.currentStep).toEqual(0);

      actions.updateStepFromData(goal);
      expect((goal.steps[0] as MergeStepData).words).toEqual(
        (goal.data as MergeDupData).plannedWords[0]
      );
      expect(goal.currentStep).toEqual(0);
    });

    it("should not update the step data of an unimplemented goal", () => {
      const goal = new HandleFlags();
      expect(actions.updateStepFromData(goal)).toEqual(false);
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
