import * as actions from "../GoalsActions";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { MergeDups } from "../../../goals/MergeDupGoal/MergeDups";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { defaultState } from "../DefaultState";
import axios from "axios";
import { HandleFlags } from "../../../goals/HandleFlags/HandleFlags";
import {
  wordsArrayMock,
  goalDataMock
} from "../../../goals/MergeDupGoal/MergeDupStep/tests/MockMergeDupData";

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("Test GoalsActions", () => {
  const createMockStore = configureMockStore([thunk]);
  it("should create an action to add a goal to history", () => {
    const goal: Goal = new CreateCharInv();
    const expectedAction: actions.AddGoalToHistory = {
      type: actions.ADD_GOAL_TO_HISTORY,
      payload: [goal]
    };
    expect(actions.addGoalToHistory(goal)).toEqual(expectedAction);
  });

  it("should create an action to load user edits", () => {
    const goalHistory: Goal[] = [new CreateCharInv(), new MergeDups()];
    const expectedAction: actions.LoadUserEdits = {
      type: actions.LOAD_USER_EDITS,
      payload: goalHistory
    };
    expect(actions.loadUserEdits(goalHistory)).toEqual(expectedAction);
  });

  it("should create an action to navigate to the next step", () => {
    const expectedAction: actions.NextStep = {
      type: actions.NEXT_STEP,
      payload: []
    };
    expect(actions.nextStep()).toEqual(expectedAction);
  });

  it("should create an async action to load user edits", () => {
    const mockStore = createMockStore(defaultState);
    const mockDispatch = mockStore.dispatch<any>(
      actions.asyncLoadUserEdits("1", "1")
    );

    let loadUserEdits: actions.LoadUserEdits = {
      type: actions.LOAD_USER_EDITS,
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

  it("should create an async action to add a goal to history", () => {
    const mockStore = createMockStore(defaultState);
    const goal: Goal = new CreateCharInv();
    const mockDispatch = mockStore.dispatch<any>(
      actions.asyncAddGoalToHistory(goal)
    );

    let addGoalToHistory: actions.AddGoalToHistory = {
      type: actions.ADD_GOAL_TO_HISTORY,
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

  it("should return the correct goal", () => {
    const goal: Goal = new HandleFlags();
    const goal2: Goal = new CreateCharInv();
    const goal3: Goal = new MergeDups();
    const history: Goal[] = [goal, goal2, goal3];

    const currentGoal: Goal = goal2;
    let returnedIndex = actions.getIndexInHistory(history, currentGoal);

    expect(returnedIndex).toEqual(1);
  });
});
