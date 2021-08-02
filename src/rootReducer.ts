import { localizeReducer } from "react-localize-redux";
import { combineReducers, Reducer } from "redux";

import { goalReducer } from "components/GoalTimeline/Redux/GoalReducer";
import { loginReducer } from "components/Login/Redux/LoginReducer";
import { passwordResetReducer } from "components/PasswordReset/Redux/ResetReducer";
import { projectReducer } from "components/Project/ProjectReducer";
import { exportProjectReducer } from "components/ProjectExport/Redux/ExportProjectReducer";
import { createProjectReducer } from "components/ProjectScreen/CreateProject/Redux/CreateProjectReducer";
import { pronunciationsReducer } from "components/Pronunciations/Redux/PronunciationsReducer";
import { treeViewReducer } from "components/TreeView/TreeViewReducer";
import { characterInventoryReducer } from "goals/CharInventoryCreation/Redux/CharacterInventoryReducer";
import { mergeDupStepReducer } from "goals/MergeDupGoal/Redux/MergeDupReducer";
import { reviewEntriesReducer } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReducer";
import { StoreState } from "types";
import { analyticsReducer } from "types/Redux/analytics";

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
  //handles localization through react-localize-redux utilities
  localize: localizeReducer,

  //login
  loginState: loginReducer,
  passwordResetState: passwordResetReducer,

  //project
  createProjectState: createProjectReducer,
  currentProjectState: projectReducer,
  exportProjectState: exportProjectReducer,

  //data entry and review entries
  treeViewState: treeViewReducer,
  reviewEntriesState: reviewEntriesReducer,
  pronunciationsState: pronunciationsReducer,

  //goal timeline and current goal
  goalsState: goalReducer,

  //merge duplicates goal
  mergeDuplicateGoal: mergeDupStepReducer,

  //character inventory goal
  characterInventoryState: characterInventoryReducer,

  //analytics state
  analyticsState: analyticsReducer,
});
