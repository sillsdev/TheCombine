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
let goal1Message = "A goal";
goal1.id = 1;
goal1.name = "Handle duplicates";
goal1.data = { words: goal1Message.split(" "), step: 1 };
let goal2: Goal = new TempGoal(tempUser);
let goal2Message = "Another goal";
goal2.id = 2;
goal2.name = "Handle flags";
goal2.data = { words: goal2Message.split(" "), step: 2 };
let goal3: Goal = new TempGoal(tempUser);
goal3.name = "Grammar check";
goal3.id = 3;
allTheGoals.push(goal1);
allTheGoals.push(goal2);
allTheGoals.push(goal3);

let suggestionsArray: Goal[] = [];
let suggestion1: Goal = new TempGoal(tempUser);
suggestion1.name = "Handle duplicates";
suggestion1.id = 4;
let suggestion2: Goal = new TempGoal(tempUser);
suggestion2.name = "Grammar check";
suggestion2.id = 5;
suggestionsArray.push(suggestion1);
suggestionsArray.push(suggestion2);

export const defaultState: GoalsState = {
  history: new Stack<Goal>([]),
  goalOptions: allTheGoals,
  suggestions: new Stack<Goal>(suggestionsArray)
};
