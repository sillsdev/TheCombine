import { simpleWord, Word } from "../../types/word";
import { defaultState as goalTimelineState } from "../GoalTimeline/DefaultState";
import { defaultState as createProjectState } from "../ProjectScreen/CreateProject/CreateProjectReducer";
import { defaultState as goalSelectorState } from "../GoalTimeline/GoalSwitcher/GoalSelectorScroll/GoalSelectorReducer";
import { defaultState as passwordResetState } from "../PasswordReset/reducer";
import { defaultState as reviewEntriesState } from "../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesReducer";
import { defaultState as treeViewState } from "../TreeView/TreeViewReducer";
import { defaultProject } from "../../types/project";

export const defaultState = {
  draggedWordState: {
    draggedWord: simpleWord("Ye", "You"),
  },
  mergeDupStepProps: {
    parentWords: [
      {
        id: 1,
        senses: [
          {
            id: 2,
            dups: [simpleWord("Thee", "You"), simpleWord("Yes", "No")],
          },
        ],
      },
    ],
    addParent: (word: Word) => word,
    dropWord: () => null,
    clearMerges: () => null,
    draggedWord: simpleWord("Thou", "You"),
  },
  treeViewState: {
    ...treeViewState,
  },
  goalsState: {
    ...goalTimelineState,
  },
  createProjectState: {
    ...createProjectState,
    name: "Test",
    success: true,
  },
  goalSelectorState: {
    ...goalSelectorState,
  },
  passwordResetState: {
    ...passwordResetState,
  },
  currentProject: {
    ...defaultProject,
    name: "Project",
  },
  reviewEntriesState: {
    ...reviewEntriesState,
  },
};
