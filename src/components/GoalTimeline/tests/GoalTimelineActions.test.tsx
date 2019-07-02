import * as actions from "../GoalTimelineActions";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { MergeDups } from "../../../goals/MergeDupGoal/MergeDups";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { defaultState } from "../DefaultState";

const createMockStore = configureMockStore([thunk]);

it("should create an action to add a goal to history", () => {
  const goal: Goal = new CreateCharInv([]);
  const expectedAction: actions.AddGoalToHistory = {
    type: actions.ADD_GOAL_TO_HISTORY,
    payload: [goal]
  };
  expect(actions.addGoalToHistory(goal)).toEqual(expectedAction);
});

it("should create an action to load user edits", () => {
  const goalHistory: Goal[] = [new CreateCharInv([]), new MergeDups([])];
  const expectedAction: actions.LoadUserEdits = {
    type: actions.LOAD_USER_EDITS,
    payload: goalHistory
  };
  expect(actions.loadUserEdits(goalHistory)).toEqual(expectedAction);
});

it("should create an action to load user edits", () => {
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
    .catch((err: any) => {
      console.log(err);
      fail();
    });
});

it("should create an action to add a goal to history", () => {
  const mockStore = createMockStore(defaultState);
  const goal: Goal = new CreateCharInv([]);
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
    .catch((err: any) => {
      console.log(err);
      fail();
    });
});
