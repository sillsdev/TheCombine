import * as actions from "../GoalSwitcherActions";
import * as navActions from "../../../Navigation/NavigationActions";
import * as timelineActions from "../../GoalTimelineActions";
import { Goal } from "../../../../types/goals";
import { CreateCharInv } from "../../../../goals/CreateCharInv/CreateCharInv";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { defaultState } from "../../../App/DefaultState";

const createMockStore = configureMockStore([thunk]);

it("dispatches actions to choose a goal to navigate to", () => {
  let goal: Goal = new CreateCharInv([]);
  let ChangeVisibleComponent: navActions.NavigationAction = {
    type: navActions.CHANGE_VISIBLE_COMPONENT,
    payload: goal
  };

  let AddGoal: timelineActions.AddGoalToHistory = {
    type: timelineActions.ADD_GOAL_TO_HISTORY,
    payload: goal
  };

  const mockStore = createMockStore(defaultState);
  mockStore.dispatch<any>(actions.chooseGoal(goal));
  expect(mockStore.getActions()).toEqual([ChangeVisibleComponent, AddGoal]);
});
