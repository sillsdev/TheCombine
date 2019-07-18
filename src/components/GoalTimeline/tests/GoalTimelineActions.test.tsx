import * as actions from "../GoalsActions";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { MergeDups } from "../../../goals/MergeDupGoal/MergeDups";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunk from "redux-thunk";
import { defaultState } from "../DefaultState";
import axios from "axios";
import { HandleFlags } from "../../../goals/HandleFlags/HandleFlags";
import {
  wordsArrayMock,
  goalDataMock
} from "../../../goals/MergeDupGoal/MergeDupStep/tests/MockMergeDupData";
import { ViewFinal } from "../../../goals/ViewFinal/ViewFinal";
import { User } from "../../../types/user";

const mockAxios = axios as jest.Mocked<typeof axios>;

let oldUser: string | null;
let oldProjectId: string | null;
const mockProjectId: string = "12345";
const mockUserEditId: string = "23456";
let mockUser: User = new User("", "", "");
mockUser.workedProjects[mockProjectId] = mockUserEditId;

const createMockStore = configureMockStore([thunk]);
const mockStore: MockStoreEnhanced<unknown, {}> = createMockStore(defaultState);

beforeAll(() => {
  oldUser = localStorage.getItem("user");
  oldProjectId = localStorage.getItem("projectId");
});

beforeEach(() => {
  localStorage.removeItem("user");
  localStorage.removeItem("projectId");
});

afterEach(() => {
  if (oldUser) localStorage.setItem("user", oldUser);
  if (oldProjectId) localStorage.setItem("projectId", oldProjectId);
  mockStore.clearActions();
});

describe("Test GoalsActions", () => {
  it("should create an action to add a goal to history", () => {
    const goal: Goal = new CreateCharInv();
    const expectedAction: actions.AddGoalToHistory = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
      payload: [goal]
    };
    expect(actions.addGoalToHistory(goal)).toEqual(expectedAction);
  });

  it("should create an action to load user edits", () => {
    const goalHistory: Goal[] = [new CreateCharInv(), new MergeDups()];
    const expectedAction: actions.LoadUserEdits = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: goalHistory
    };
    expect(actions.loadUserEdits(goalHistory)).toEqual(expectedAction);
  });

  it("should create an action to navigate to the next step", () => {
    const expectedAction: actions.NextStep = {
      type: actions.GoalsActions.NEXT_STEP,
      payload: []
    };
    expect(actions.nextStep()).toEqual(expectedAction);
  });

  it("should create an action to update a goal", () => {
    const goal: Goal = new CreateCharInv();
    const expectedAction: actions.UpdateGoal = {
      type: actions.GoalsActions.UPDATE_GOAL,
      payload: [goal]
    };
    expect(actions.updateGoal(goal)).toEqual(expectedAction);
  });

  it("should create an async action to load user edits", () => {
    const mockDispatch = mockStore.dispatch<any>(
      actions.asyncLoadExistingUserEdits("1", "1")
    );

    let loadUserEdits: actions.LoadUserEdits = {
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

    let loadUserEditsAction: actions.LoadUserEdits = {
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

    let addGoalToHistory: actions.AddGoalToHistory = {
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

  it("should update goal data", () => {
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: wordsArrayMock
      })
    );
    const expectedGoal: Goal = new MergeDups();
    expectedGoal.data = goalDataMock;

    const goal: Goal = new MergeDups();
    actions
      .loadGoalData(goal)
      .then(returnedGoal => {
        expect(returnedGoal.data).toEqual(expectedGoal.data);
      })
      .catch((err: string) => {
        fail(err);
      });
  });

  it("should not change the goal data", () => {
    const goal: Goal = new HandleFlags();

    const expectedGoal: Goal = new HandleFlags();

    actions
      .loadGoalData(goal)
      .then(returnedGoal => {
        expect(returnedGoal.data).toEqual(expectedGoal.data);
      })
      .catch((err: string) => {
        fail(err);
      });
  });

  it("should return a userEditId", () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("projectId", mockProjectId);
    expect(actions.getUserEditId(mockUser)).toEqual(mockUserEditId);
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
