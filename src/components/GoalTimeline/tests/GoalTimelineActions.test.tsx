import * as actions from "../GoalsActions";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { MergeDups, MergeDupData } from "../../../goals/MergeDupGoal/MergeDups";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunk from "redux-thunk";
import { HandleFlags } from "../../../goals/HandleFlags/HandleFlags";
import { goalDataMock } from "../../../goals/MergeDupGoal/MergeDupStep/tests/MockMergeDupData";
import { ViewFinal } from "../../../goals/ViewFinal/ViewFinal";
import { User } from "../../../types/user";
import {
  MergeTreeActions,
  MergeTreeAction
} from "../../../goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import { defaultState as goalsDefaultState } from "../DefaultState";

jest.mock(
  ".././../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder",
  () => {
    const dupFinder = jest.requireActual(
      ".././../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder"
    );
    return jest.fn().mockImplementation(() => ({
      ...dupFinder,
      getNextDups: jest.fn(() => {
        return Promise.resolve(mockGoalData.plannedWords);
      })
    }));
  }
);

// At compile time, jest.mock calls will be hoisted to the top of the file,
// so calls to imported variables fail. Fixed by initializing these variables
// inside of beforeAll()
let mockGoalData: MergeDupData;

let oldUser: string | null;
let oldProjectId: string | null;
const mockProjectId: string = "12345";
const mockUserEditId: string = "23456";
let mockUser: User = new User("", "", "");
mockUser.workedProjects[mockProjectId] = mockUserEditId;

const createMockStore = configureMockStore([thunk]);
let mockStore: MockStoreEnhanced<unknown, {}>;

beforeAll(() => {
  oldUser = localStorage.getItem("user");
  oldProjectId = localStorage.getItem("projectId");
  mockGoalData = goalDataMock;

  const mockStoreState = {
    goalsState: {
      historyState: {
        history: [...goalsDefaultState.historyState.history]
      },
      allPossibleGoals: [...goalsDefaultState.allPossibleGoals],
      suggestionsState: {
        suggestions: [...goalsDefaultState.suggestionsState.suggestions]
      }
    }
  };

  mockStore = createMockStore(mockStoreState);
});

beforeEach(() => {
  localStorage.removeItem("user");
  localStorage.removeItem("projectId");
});

afterEach(() => {
  mockStore.clearActions();
});

afterAll(() => {
  if (oldUser) localStorage.setItem("user", oldUser);
  if (oldProjectId) localStorage.setItem("projectId", oldProjectId);
});

describe("Test GoalsActions", () => {
  it("should create an action to add a goal to history", () => {
    const goal: Goal = new CreateCharInv();
    const expectedAction: actions.AddGoalToHistoryAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
      payload: [goal]
    };
    expect(actions.addGoalToHistory(goal)).toEqual(expectedAction);
  });

  it("should create an action to load user edits", () => {
    const goalHistory: Goal[] = [new CreateCharInv(), new MergeDups()];
    const expectedAction: actions.LoadUserEditsAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: goalHistory
    };
    expect(actions.loadUserEdits(goalHistory)).toEqual(expectedAction);
  });

  it("should create an action to update a goal", () => {
    const goal: Goal = new CreateCharInv();
    const expectedAction: actions.UpdateGoalAction = {
      type: actions.GoalsActions.UPDATE_GOAL,
      payload: [goal]
    };
    expect(actions.updateGoal(goal)).toEqual(expectedAction);
  });

  it("should create an async action to load user edits", () => {
    const mockDispatch = mockStore.dispatch<any>(
      actions.asyncLoadExistingUserEdits("1", "1")
    );

    let loadUserEdits: actions.LoadUserEditsAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: []
    };

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([loadUserEdits]);
      })
      .catch((err: string) => {
        fail(err);
      });
  });

  it("should dispatch an action to load a user edit", async () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("projectId", mockProjectId);

    await mockStore
      .dispatch<any>(actions.asyncGetUserEdits())
      .then(() => {})
      .catch((err: string) => {
        fail(err);
      });

    let loadUserEditsAction: actions.LoadUserEditsAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: []
    };

    expect(mockStore.getActions()).toEqual([loadUserEditsAction]);
  });

  it("should not dispatch any actions when creating a new user edit", async () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.removeItem("projectId");
    await mockStore
      .dispatch<any>(actions.asyncGetUserEdits())
      .then(() => {})
      .catch((err: string) => {
        fail(err);
      });

    expect(mockStore.getActions()).toEqual([]);
  });

  it("should create an async action to add a goal to history", () => {
    const goal: Goal = new CreateCharInv();
    localStorage.setItem("projectId", mockProjectId);
    localStorage.setItem("user", JSON.stringify(mockUser));
    const mockDispatch = mockStore.dispatch<any>(
      actions.asyncAddGoalToHistory(goal)
    );

    let addGoalToHistory: actions.AddGoalToHistoryAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
      payload: [goal]
    };

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([addGoalToHistory]);
      })
      .catch((err: string) => {
        fail(err);
      });
  });

  it("should return a user", () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    expect(actions.getUser()).toEqual(mockUser);
  });

  it("should return undefined when there is no user", () => {
    expect(actions.getUser()).toEqual(undefined);
  });

  it("should dispatch UPDATE_GOAL and SET_DATA", async () => {
    let goalToUpdate: Goal = new MergeDups();
    goalToUpdate.numSteps = 1;
    goalToUpdate.steps = [
      {
        words: [...goalDataMock.plannedWords[0]]
      }
    ];

    let expectedUpdatedGoal: Goal = new MergeDups();
    expectedUpdatedGoal.currentStep = 1;
    expectedUpdatedGoal.hash = goalToUpdate.hash;
    expectedUpdatedGoal.numSteps = goalToUpdate.numSteps;
    expectedUpdatedGoal.data = {
      plannedWords: [...goalDataMock.plannedWords]
    };
    expectedUpdatedGoal.steps = [
      {
        words: [...goalDataMock.plannedWords[0]]
      }
    ];

    let updateGoal: actions.UpdateGoalAction = {
      type: actions.GoalsActions.UPDATE_GOAL,
      payload: [expectedUpdatedGoal]
    };

    let setWordData: MergeTreeAction = {
      type: MergeTreeActions.SET_DATA,
      payload: [...goalDataMock.plannedWords[0]]
    };

    const mockStoreState = {
      goalsState: {
        historyState: {
          history: [goalToUpdate]
        },
        allPossibleGoals: [...goalsDefaultState.allPossibleGoals],
        suggestionsState: {
          suggestions: [...goalsDefaultState.suggestionsState.suggestions]
        }
      }
    };

    mockStore = createMockStore(mockStoreState);

    await mockStore
      .dispatch<any>(actions.loadGoalData(goalToUpdate))
      .then(() => {})
      .catch((err: string) => fail(err));
    expect(mockStore.getActions()).toEqual([updateGoal, setWordData]);
  });

  it("should not dispatch any actions", async () => {
    const goal: Goal = new HandleFlags();
    const expectedGoal: Goal = new HandleFlags();

    await mockStore
      .dispatch<any>(actions.loadGoalData(goal))
      .then((returnedGoal: Goal) => {
        expect(returnedGoal.data).toEqual(expectedGoal.data);
      })
      .catch((err: string) => fail(err));

    expect(mockStore.getActions()).toEqual([]);
  });

  it("should load goal data for MergeDups", async () => {
    let goal: Goal = new MergeDups();
    await mockStore
      .dispatch<any>(actions.loadGoalData(goal))
      .then((returnedGoal: Goal) => {
        expect(returnedGoal.data).toEqual(goalDataMock);
      })
      .catch((err: string) => fail(err));
  });

  it("should not load any goal data", async () => {
    const goal: Goal = new HandleFlags();

    await mockStore
      .dispatch<any>(actions.loadGoalData(goal))
      .then((returnedGoal: Goal) => {
        expect(returnedGoal.data).toEqual({});
      })
      .catch((err: string) => fail(err));
  });

  it("Should update the step data of a goal", () => {
    const goal: MergeDups = new MergeDups();
    goal.data = goalDataMock;
    expect(goal.steps).toEqual([]);
    expect(goal.currentStep).toEqual(0);

    const updatedGoal: MergeDups = actions.updateStepData(goal) as MergeDups;

    expect(updatedGoal.steps[0].words).toEqual(goal.data.plannedWords[0]);
    expect(updatedGoal.currentStep).toEqual(1);
  });

  it("Should not update the step data of an unimplemented goal", () => {
    const goal: HandleFlags = new HandleFlags();
    expect(goal.steps).toEqual([]);
    expect(goal.currentStep).toEqual(0);

    const updatedGoal: HandleFlags = actions.updateStepData(
      goal
    ) as HandleFlags;

    expect(updatedGoal.steps).toEqual([]);
    expect(updatedGoal.currentStep).toEqual(0);
  });

  it("should return a userEditId", () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("projectId", mockProjectId);
    expect(actions.getUserEditId(mockUser)).toEqual(mockUserEditId);
  });

  it("should return undefined when a user edit doesn't exist", () => {
    let user: User = new User("", "", "");
    localStorage.setItem("user", JSON.stringify(user));
    expect(actions.getUserEditId(mockUser)).toEqual(undefined);
  });

  it("should return the correct goal", () => {
    const goal: Goal = new HandleFlags();
    const goal2: Goal = new CreateCharInv();
    const goal3: Goal = new MergeDups();
    const history: Goal[] = [goal, goal2, goal3];

    const currentGoal: Goal = goal2;
    let returnedIndex = actions.getIndexInHistory(history, currentGoal);

    expect(returnedIndex).toEqual(1);
  });

  it("should return -1 when a goal doesn't exist", () => {
    const goal: Goal = new HandleFlags();
    const goal2: Goal = new CreateCharInv();
    const goal3: Goal = new MergeDups();
    const history: Goal[] = [goal, goal2, goal3];

    const currentGoal: Goal = new ViewFinal();
    let returnedIndex = actions.getIndexInHistory(history, currentGoal);

    expect(returnedIndex).toEqual(-1);
  });
});
