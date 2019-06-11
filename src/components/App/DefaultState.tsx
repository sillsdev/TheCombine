import { simpleWord, Word } from "../../types/word";
import { defaultState as goalTimelineState } from "../GoalView/GoalTimelineReducers";
import { defaultState as navigationState } from "../Nav/NavReducer";

export const defaultState = {
  draggedWord: {
    draggedWord: simpleWord("Ye", "You")
  },
  mergeDupStepProps: {
    parentWords: [
      {
        id: 1,
        senses: [
          {
            id: 2,
            dups: [simpleWord("Thee", "You"), simpleWord("Yes", "No")]
          }
        ]
      }
    ],
    addParent: (word: Word) => word,
    dropWord: () => null,
    clearMerges: () => null,
    draggedWord: simpleWord("Thou", "You")
  },
  goalsState: {
    ...goalTimelineState
  },
  navState: {
    ...navigationState
  }
};
