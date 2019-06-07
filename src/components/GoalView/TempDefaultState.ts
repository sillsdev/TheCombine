import { User } from "../../types/user";
import { TempGoal } from "../../goals/tempGoal";
import { Goal, GoalsState } from "../../types/goals";
import Stack from "../../types/stack";

const tempUser: User = {
  name: "Chewbacca",
  username: "WUUAHAHHHAAAAAAAAAA",
  id: 1
};

let allTheGoals: Goal[] = [];
let goal1: Goal = new TempGoal(tempUser);
goal1.id = 1;
goal1.name = "handleDuplicates";
let goal2: Goal = new TempGoal(tempUser);
goal2.id = 2;
goal2.name = "handleFlags";
let goal3: Goal = new TempGoal(tempUser);
goal3.name = "grammarCheck";
goal3.id = 3;
allTheGoals.push(goal1);
allTheGoals.push(goal2);
allTheGoals.push(goal3);

let suggestionsArray: Goal[] = [];
let suggestion1: Goal = new TempGoal(tempUser);
suggestion1.name = "handleDuplicates";
suggestion1.id = 4;
let suggestion2: Goal = new TempGoal(tempUser);
suggestion2.name = "grammarCheck";
suggestion2.id = 5;
suggestionsArray.push(suggestion1);
suggestionsArray.push(suggestion2);

export const defaultState: GoalsState = {
  historyState: {
    history: new Stack<Goal>([])
  },
  goalOptions: allTheGoals,
  suggestionsState: {
    suggestions: new Stack<Goal>(suggestionsArray)
  }
};
