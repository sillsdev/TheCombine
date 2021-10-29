import { defaultState as goalTimelineState } from "components/GoalTimeline/DefaultState";
import { defaultState as loginState } from "components/Login/Redux/LoginReducer";
import { defaultState as passwordResetState } from "components/PasswordReset/Redux/ResetReducer";
import { defaultState as currentProjectState } from "components/Project/ProjectReduxTypes";
import { defaultState as exportProjectState } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { defaultState as createProjectState } from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { defaultState as pronunciationsState } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { defaultState as treeViewState } from "components/TreeView/TreeViewReducer";
import { defaultState as characterInventoryState } from "goals/CharInventoryCreation/Redux/CharacterInventoryReducer";
import { defaultState as mergeDuplicateGoal } from "goals/MergeDupGoal/Redux/MergeDupReducer";
import { defaultState as reviewEntriesState } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReduxTypes";
import { defaultState as analyticsState } from "types/Redux/analyticsReduxTypes";

export const defaultState = {
  //login
  loginState: { ...loginState },
  passwordResetState: { ...passwordResetState },

  //project
  createProjectState: {
    ...createProjectState,
    name: "Test",
    success: true,
  },
  currentProjectState: { ...currentProjectState },
  exportProjectState: { ...exportProjectState },

  //data entry and review entries
  treeViewState: { ...treeViewState },
  reviewEntriesState: { ...reviewEntriesState },
  pronunciationsState: { ...pronunciationsState },

  //goal timeline and current goal
  goalsState: { ...goalTimelineState },

  //merge duplicates goal
  mergeDuplicateGoal: { ...mergeDuplicateGoal },

  //character inventory goal
  characterInventoryState: { ...characterInventoryState },

  //analytics state
  analyticsState: { ...analyticsState },
};
