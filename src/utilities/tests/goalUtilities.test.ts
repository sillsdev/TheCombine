import { MergeUndoIds } from "api/models";
import { MergeDups } from "goals/MergeDuplicates/MergeDupsTypes";
import { goalDataMock } from "goals/MergeDuplicates/Redux/tests/MergeDupsDataMock";
import { Goal } from "types/goals";
import {
  convertEditToGoal,
  convertGoalToEdit,
  maxNumSteps,
} from "utilities/goalUtilities";

describe("goalUtilities", () => {
  describe("convertGoalToEdit, convertEditToGoal", () => {
    it("should maintain guid, goalType, steps, and changes", () => {
      const oldGoal: Goal = new MergeDups();
      oldGoal.numSteps = maxNumSteps(oldGoal.goalType);
      oldGoal.steps = [
        { words: [...goalDataMock.plannedWords[0]] },
        { words: [...goalDataMock.plannedWords[1]] },
      ];
      oldGoal.changes = { merges: [{} as MergeUndoIds, {} as MergeUndoIds] };
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
