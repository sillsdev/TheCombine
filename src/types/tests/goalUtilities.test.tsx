import { MergeDups } from "goals/MergeDupGoal/MergeDups";
import { goalDataMock } from "goals/MergeDupGoal/Redux/tests/MockMergeDupData";
import {
  convertEditToGoal,
  convertGoalToEdit,
  maxNumSteps,
} from "types/goalUtilities";
import { Goal } from "types/goals";

describe("goalUtilities", () => {
  describe("convertGoalToEdit, convertEditToGoal", () => {
    it("should maintain guid, goalType, steps, and changes", () => {
      const oldGoal: Goal = new MergeDups();
      oldGoal.numSteps = maxNumSteps(oldGoal.goalType);
      oldGoal.steps = [
        {
          words: [...goalDataMock.plannedWords[0]],
        },
        {
          words: [...goalDataMock.plannedWords[1]],
        },
      ];
      oldGoal.changes = { merges: [{}, {}] };
      const edit = convertGoalToEdit(oldGoal);
      const newGoal = convertEditToGoal(edit);
      expect(newGoal.guid).toEqual(oldGoal.guid);
      expect(newGoal.goalType).toEqual(oldGoal.goalType);
      expect(newGoal.steps).toEqual(oldGoal.steps);
      expect(newGoal.numSteps).toEqual(oldGoal.steps.length);
      expect(newGoal.changes).toEqual(oldGoal.changes);
    });
  });
});
