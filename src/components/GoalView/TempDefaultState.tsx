import React from "react";
import { User } from "../../types/user";
import { BaseGoal } from "../../types/goals";
import { Goal, GoalsState } from "../../types/goals";
import Stack from "../../types/stack";

const tempUser: User = {
  name: "Chewbacca",
  username: "WUUAHAHHHAAAAAAAAAA",
  id: 1
};

let allTheGoals: Goal[] = [];
let goal1: Goal = new BaseGoal();
goal1.id = 1;
goal1.name = "handleDuplicates";
goal1.user = tempUser;
goal1.select = () => <div>Handle Duplicates</div>;
let goal2: Goal = new BaseGoal();
goal2.id = 2;
goal2.name = "handleFlags";
goal2.user = tempUser;
goal2.select = () => <div>Handle Flags</div>;
let goal3: Goal = new BaseGoal();
goal3.id = 3;
goal3.name = "grammarCheck";
goal3.user = tempUser;
goal3.select = () => <div>Grammar Check</div>;
allTheGoals.push(goal1);
allTheGoals.push(goal2);
allTheGoals.push(goal3);

let suggestionsArray: Goal[] = [];
let suggestion1: Goal = new BaseGoal();
suggestion1.id = 4;
suggestion1.name = "handleDuplicates";
suggestion1.user = tempUser;
suggestion1.select = () => <div>Handle Duplicates</div>;
let suggestion2: Goal = new BaseGoal();
suggestion2.id = 5;
suggestion2.name = "grammarCheck";
suggestion2.user = tempUser;
suggestion2.select = () => <div>Grammar Check</div>;
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
