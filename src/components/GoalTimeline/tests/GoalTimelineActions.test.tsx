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
import {
  MergeTreeAction,
  MergeTreeActions,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
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
    loadMergeDupsData: (goal: MergeDups) => mockLoadMergeDupsData(goal),
  };
});

jest.mock("backend", () => {
  return {
    addGoalToUserEdit: (id: string, goal: Goal) =>
      mockAddGoalToUserEdit(id, goal),
    createUserEdit: () => mockCreateUserEdit(),
    getUser: (id: string) => mockGetUser(id),
    getUserEditById: (id: string, index: string) =>
      mockGetUserEditById(id, index),
    updateUser: (user: User) => mockUpdateUser(user),
  };
});

const mockAddGoalToUserEdit = jest.fn();
const mockCreateUserEdit = jest.fn();
const mockGetUser = jest.fn();
const mockGetUserEditById = jest.fn();
const mockLoadMergeDupsData = jest.fn();
const mockUpdateUser = jest.fn();
function setMockFunctions() {
  mockAddGoalToUserEdit.mockResolvedValue(mockGoal);
  mockCreateUserEdit.mockResolvedValue({});
  mockGetUser.mockResolvedValue(mockUser);
  mockGetUserEditById.mockResolvedValue(mockUserEdit);
  mockLoadMergeDupsData.mockImplementation((goal: Goal) => {
    goal.data = { plannedWords: goalDataMock.plannedWords };
    goal.numSteps = goalDataMock.plannedWords.length;
    return goal;
  });
  mockUpdateUser.mockResolvedValue(mockUser);
}

// At compile time, jest.mock calls will be hoisted to the top of the file,
// so calls to imported variables fail. Fixed by initializing these variables
// inside of beforeAll() or beforeEach()
const createMockStore = configureMockStore([thunk]);
let mockStore: MockStoreEnhanced<unknown, {}>;
let oldProjectId: string;
let oldUser: User | undefined;

const mockProjectId = "123";
const mockUserEditId = "456";
const mockUserEdit: UserEdit = { id: mockUserEditId, edits: [] };
const mockUserId = "789";
let mockUser = new User("", "", "");
mockUser.id = mockUserId;
mockUser.workedProjects[mockProjectId] = mockUserEditId;
const mockGoal: Goal = new CreateCharInv();

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
      payload: [goal],
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
      payload: [goal],
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
    it("should create an async action to add a goal to history", async () => {
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);
      const goal: Goal = new CreateCharInv();
      await mockStore.dispatch<any>(actions.asyncAddGoalToHistory(goal));
      const addGoalToHistory: actions.AddGoalToHistoryAction = {
        type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
        payload: [goal],
      };
      expect(mockStore.getActions()).toEqual([addGoalToHistory]);
    });
  });

  describe("asyncLoadGoalData", () => {
    it("should dispatch UPDATE_GOAL and SET_DATA", async () => {
      const goalToUpdate: Goal = new MergeDups();
      goalToUpdate.numSteps = maxNumSteps(goalToUpdate.goalType);
      goalToUpdate.steps = [
        {
          words: [...goalDataMock.plannedWords[0]],
        },
      ];

      const expectedUpdatedGoal: Goal = new MergeDups();
      expectedUpdatedGoal.currentStep = 0;
      expectedUpdatedGoal.hash = goalToUpdate.hash;
      expectedUpdatedGoal.numSteps = goalToUpdate.numSteps;
      expectedUpdatedGoal.data = {
        plannedWords: [...goalDataMock.plannedWords],
      };
      expectedUpdatedGoal.steps = [
        {
          words: [...goalDataMock.plannedWords[0]],
        },
      ];

      const updateGoal: actions.UpdateGoalAction = {
        type: actions.GoalsActions.UPDATE_GOAL,
        payload: [expectedUpdatedGoal],
      };

      const setWordData: MergeTreeAction = {
        type: MergeTreeActions.SET_DATA,
        payload: [...goalDataMock.plannedWords[0]],
      };

      const mockStoreState = {
        goalsState: {
          historyState: {
            history: [goalToUpdate],
          },
          allPossibleGoals: [...defaultState.allPossibleGoals],
          suggestionsState: {
            suggestions: [...defaultState.suggestionsState.suggestions],
          },
        },
      };

      mockStore = createMockStore(mockStoreState);
      await mockStore.dispatch<any>(actions.asyncLoadGoalData(goalToUpdate));
      expect(mockStore.getActions()).toEqual([updateGoal, setWordData]);
    });

    it("should not dispatch any actions", async () => {
      const goal: Goal = new HandleFlags();
      const expectedGoal: Goal = new HandleFlags();
      const returnedGoal = await mockStore.dispatch<any>(
        actions.asyncLoadGoalData(goal)
      );
      expect(returnedGoal.data).toEqual(expectedGoal.data);
      expect(mockStore.getActions()).toEqual([]);
    });

    it("should load goal data for MergeDups", async () => {
      let goal: Goal = new MergeDups();
      goal = await mockStore.dispatch<any>(actions.asyncLoadGoalData(goal));
      const data = goal.data as MergeDupData;
      expect(data.plannedWords.length).toBeGreaterThan(0);
    });

    it("should not load any goal data", async () => {
      const goal: Goal = new HandleFlags();
      const returnedGoal = await mockStore.dispatch<any>(
        actions.asyncLoadGoalData(goal)
      );
      expect(returnedGoal.data).toEqual({});
    });
  });

  describe("updateStepData", () => {
    it("should update the step data of a goal", () => {
      const goal = new MergeDups();
      goal.data = goalDataMock;
      expect(goal.steps).toEqual([]);
      expect(goal.currentStep).toEqual(0);

      const updatedGoal = actions.updateStepData(goal);
      expect((updatedGoal.steps[0] as MergeStepData).words).toEqual(
        (goal.data as MergeDupData).plannedWords[0]
      );
      expect(updatedGoal.currentStep).toEqual(0);
    });

    it("should not update the step data of an unimplemented goal", () => {
      const goal = new HandleFlags();
      expect(goal.steps).toEqual([]);
      expect(goal.currentStep).toEqual(0);

      const updatedGoal: HandleFlags = actions.updateStepData(goal);
      expect(updatedGoal.steps).toEqual([]);
      expect(updatedGoal.currentStep).toEqual(0);
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
