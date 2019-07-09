import * as actions from "../GoalsActions";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { MergeDups } from "../../../goals/MergeDupGoal/MergeDups";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { defaultState } from "../DefaultState";
import { goalDataMock, wordsArrayMock } from "./GoalTimelineReducers.test";
import axios from "axios";

const mockAxios = axios as jest.Mocked<typeof axios>;

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

it("should create an async action to load user edits", () => {
  const mockStore = createMockStore(defaultState);
  const mockDispatch = mockStore.dispatch<any>(actions.asyncLoadUserEdits("1"));

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
  const goal: Goal = new CreateCharInv();

  const expectedGoal: Goal = new CreateCharInv();

  actions
    .loadGoalData(goal)
    .then(returnedGoal => {
      expect(returnedGoal.data).toEqual(expectedGoal.data);
    })
    .catch((err: string) => {
      fail(err);
    });
});
