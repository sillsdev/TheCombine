import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunk from "redux-thunk";

import * as LocalStorage from "backend/localStorage";
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
import { defaultState as goalsDefaultState } from "components/GoalTimeline/DefaultState";
import * as actions from "components/GoalTimeline/GoalsActions";

jest.mock("goals/MergeDupGoal/DuplicateFinder/DuplicateFinder", () => {
  const dupFinder = jest.requireActual(
    "goals/MergeDupGoal/DuplicateFinder/DuplicateFinder"
  );
  return jest.fn().mockImplementation(() => ({
    ...dupFinder,
    getNextDups: jest.fn(() => {
      return Promise.resolve(mockGoalData.plannedWords);
    }),
  }));
});

jest.mock("backend", () => {
  return {
    getUser: jest.fn((_userId: string) => {
      return Promise.resolve(mockUser);
    }),
    getUserEditById: jest.fn((_projId: string, _index: string) => {
      return Promise.resolve(mockUserEdit);
    }),
    createUserEdit: jest.fn(() => {
      return Promise.resolve({});
    }),
    updateUser: jest.fn((_user: User) => {
      return Promise.resolve(mockUser);
    }),
    addGoalToUserEdit: jest.fn((_userEditId: string, _goal: Goal) => {
      return Promise.resolve(mockGoal);
    }),
  };
});

// At compile time, jest.mock calls will be hoisted to the top of the file,
// so calls to imported variables fail. Fixed by initializing these variables
// inside of beforeAll()
let mockGoalData: MergeDupData;
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

  mockGoalData = goalDataMock;

  const mockStoreState = {
    goalsState: {
      historyState: {
        history: [...goalsDefaultState.historyState.history],
      },
      allPossibleGoals: [...goalsDefaultState.allPossibleGoals],
      suggestionsState: {
        suggestions: [...goalsDefaultState.suggestionsState.suggestions],
      },
    },
  };

  mockStore = createMockStore(mockStoreState);
});

beforeEach(() => {
  // Clear everything from localStorage interacted with by these tests.
  LocalStorage.remove(LocalStorage.LocalStorageKey.ProjectId);
  LocalStorage.setCurrentUser(mockUser);
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

    let loadUserEdits: actions.LoadUserEditsAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: [],
    };
    expect(mockStore.getActions()).toEqual([loadUserEdits]);
  });

  describe("asyncGetUserEdits", () => {
    it("should dispatch an action to load a user edit", async () => {
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);

      await mockStore
        .dispatch<any>(actions.asyncGetUserEdits())
        .then(() => {})
        .catch((err: string) => {
          fail(err);
        });

      let loadUserEditsAction: actions.LoadUserEditsAction = {
        type: actions.GoalsActions.LOAD_USER_EDITS,
        payload: [],
      };

      expect(mockStore.getActions()).toEqual([loadUserEditsAction]);
    });

    it("should not dispatch any actions when creating a new user edit", async () => {
      LocalStorage.setCurrentUser(mockUser);

      await mockStore
        .dispatch<any>(actions.asyncGetUserEdits())
        .then(() => {})
        .catch((err: string) => {
          fail(err);
        });

      expect(mockStore.getActions()).toEqual([]);
    });
  });

  describe("asyncAddGoalToHistory", () => {
    it("should create an async action to add a goal to history", async () => {
      const goal: Goal = new CreateCharInv();
      LocalStorage.setCurrentUser(mockUser);
      LocalStorage.setProjectId(mockProjectId);

      await mockStore.dispatch<any>(actions.asyncAddGoalToHistory(goal));

      let addGoalToHistory: actions.AddGoalToHistoryAction = {
        type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
        payload: [goal],
      };

      expect(mockStore.getActions()).toEqual([addGoalToHistory]);
    });
  });

  describe("asyncLoadGoalData", () => {
    it("should dispatch UPDATE_GOAL and SET_DATA", async () => {
      let goalToUpdate: Goal = new MergeDups();
      goalToUpdate.numSteps = maxNumSteps(goalToUpdate.goalType);
      goalToUpdate.steps = [
        {
          words: [...goalDataMock.plannedWords[0]],
        },
      ];

      let expectedUpdatedGoal: Goal = new MergeDups();
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

      let updateGoal: actions.UpdateGoalAction = {
        type: actions.GoalsActions.UPDATE_GOAL,
        payload: [expectedUpdatedGoal],
      };

      let setWordData: MergeTreeAction = {
        type: MergeTreeActions.SET_DATA,
        payload: [...goalDataMock.plannedWords[0]],
      };

      const mockStoreState = {
        goalsState: {
          historyState: {
            history: [goalToUpdate],
          },
          allPossibleGoals: [...goalsDefaultState.allPossibleGoals],
          suggestionsState: {
            suggestions: [...goalsDefaultState.suggestionsState.suggestions],
          },
        },
      };

      mockStore = createMockStore(mockStoreState);

      try {
        await mockStore.dispatch<any>(actions.asyncLoadGoalData(goalToUpdate));
      } catch (err) {
        fail(err);
      }
      expect(mockStore.getActions()).toEqual([updateGoal, setWordData]);
    });

    it("should not dispatch any actions", async () => {
      const goal: Goal = new HandleFlags();
      const expectedGoal: Goal = new HandleFlags();

      await mockStore
        .dispatch<any>(actions.asyncLoadGoalData(goal))
        .then((returnedGoal: Goal) => {
          expect(returnedGoal.data).toEqual(expectedGoal.data);
        })
        .catch((err: string) => fail(err));

      expect(mockStore.getActions()).toEqual([]);
    });

    it("should load goal data for MergeDups", async () => {
      let goal: Goal = new MergeDups();
      try {
        goal = await mockStore.dispatch<any>(actions.asyncLoadGoalData(goal));
        let data = goal.data as MergeDupData;
        expect(data.plannedWords.length).toBeGreaterThan(0);
      } catch (err) {
        fail(err);
      }
    });

    it("should not load any goal data", async () => {
      const goal: Goal = new HandleFlags();

      await mockStore
        .dispatch<any>(actions.asyncLoadGoalData(goal))
        .then((returnedGoal: Goal) => {
          expect(returnedGoal.data).toEqual({});
        })
        .catch((err: string) => fail(err));
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
