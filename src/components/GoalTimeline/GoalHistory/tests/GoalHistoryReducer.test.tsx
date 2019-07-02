import { goalHistoryReducer } from "../GoalHistoryReducer";
import { GoalHistoryState } from "../../../../types/goals";
import { MockActionGoalArrayInstance } from "../../../../types/action";

it("Should return the default state", () => {
  const newState: GoalHistoryState = {
    history: []
  };

  expect(goalHistoryReducer(undefined, MockActionGoalArrayInstance)).toEqual(
    newState
  );
});
