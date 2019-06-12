import React from "react";
import { Goal, GoalsState } from "../../types/goals";
import Stack from "../../types/stack";
import MergeDupStep from "../../goals/MergeDupGoal/MergeDupStep";
import { MergeDups } from "../../goals/MergeDups/MergeDups";
import { CreateCharInv } from "../../goals/CreateCharInv/CreateCharInv";
import { CreateStrWordInv } from "../../goals/CreateStrWordInv/CreateStrWordInv";
import { HandleFlags } from "../../goals/HandleFlags/HandleFlags";
import { SpellCheckGloss } from "../../goals/SpellCheckGloss/SpellCheckGloss";
import { ValidateChars } from "../../goals/ValidateChars/ValidateChars";
import { ValidateStrWords } from "../../goals/ValidateStrWords/ValidateStrWords";
import { ViewFinal } from "../../goals/ViewFinal/ViewFinal";

let goal1: Goal = new CreateCharInv([]);
let goal2: Goal = new CreateStrWordInv([]);
let goal3: Goal = new HandleFlags([]);
let goal4: Goal = new MergeDups([<MergeDupStep />]);
let goal5: Goal = new SpellCheckGloss([]);
let goal6: Goal = new ValidateChars([]);
let goal7: Goal = new ValidateStrWords([]);
let goal8: Goal = new ViewFinal([]);
let allTheGoals: Goal[] = [
  goal1,
  goal2,
  goal3,
  goal4,
  goal5,
  goal6,
  goal7,
  goal8
];

let suggestion1: Goal = new MergeDups([<MergeDupStep />]);
let suggestion2: Goal = new SpellCheckGloss([]);

let suggestionsArray: Goal[] = [suggestion1, suggestion2];

export const defaultState: GoalsState = {
  historyState: {
    history: new Stack<Goal>([])
  },
  goalOptions: allTheGoals,
  suggestionsState: {
    suggestions: new Stack<Goal>(suggestionsArray)
  }
};
