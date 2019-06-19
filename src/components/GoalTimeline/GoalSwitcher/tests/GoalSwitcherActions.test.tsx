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
  let NavigateForward: navActions.NavigateForward = {
    type: navActions.NAVIGATE_FORWARD,
    payload: goal
  };

  let AddGoal: timelineActions.AddGoal = {
    type: timelineActions.ADD_GOAL,
    payload: goal
  };

  const mockStore = createMockStore(defaultState);
  mockStore.dispatch<any>(actions.chooseGoal(goal));
  expect(mockStore.getActions()).toEqual([NavigateForward, AddGoal]);
});
