import { CreateCharInv } from "../../goals/CreateCharInv/CreateCharInv";
// import { CreateStrWordInv } from "../../goals/CreateStrWordInv/CreateStrWordInv";
// import { HandleFlags } from "../../goals/HandleFlags/HandleFlags";
import { MergeDups } from "../../goals/MergeDupGoal/MergeDups";
import { ReviewEntries } from "../../goals/ReviewEntries/ReviewEntries";
// import { SpellCheckGloss } from "../../goals/SpellCheckGloss/SpellCheckGloss";
// import { ValidateChars } from "../../goals/ValidateChars/ValidateChars";
// import { ValidateStrWords } from "../../goals/ValidateStrWords/ValidateStrWords";
import { Goal, GoalsState } from "../../types/goals";

// Unimplemented goals commented out.
const allTheGoals: Goal[] = [
  // new Goal(),
  new CreateCharInv(),
  // new CreateStrWordInv(),
  // new HandleFlags(),
  new MergeDups(),
  new ReviewEntries(),
  // new SpellCheckGloss(),
  // new ValidateChars(),
  // new ValidateStrWords(),
];

export const defaultState: GoalsState = {
  historyState: {
    history: [],
  },
  allPossibleGoals: allTheGoals,
  suggestionsState: {
    suggestions: [...allTheGoals],
  },
};
