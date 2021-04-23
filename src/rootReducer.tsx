import { localizeReducer } from "react-localize-redux";
import { combineReducers, Reducer } from "redux";

import { goalsReducer } from "components/GoalTimeline/Redux/GoalsReducer";
import { loginReducer } from "components/Login/Redux/LoginReducer";
import { passwordResetReducer } from "components/PasswordReset/Redux/ResetReducer";
import { projectReducer } from "components/Project/ProjectReducer";
import { exportProjectReducer } from "components/ProjectExport/Redux/ExportProjectReducer";
import { createProjectReducer } from "components/ProjectScreen/CreateProject/Redux/CreateProjectReducer";
import { pronunciationsReducer } from "components/Pronunciations/Redux/PronunciationsReducer";
import { treeViewReducer } from "components/TreeView/TreeViewReducer";
import { characterInventoryReducer } from "goals/CharInventoryCreation/Redux/CharacterInventoryReducer";
import { mergeDupStepReducer } from "goals/MergeDupGoal/MergeDupStep/Redux/MergeDupStepReducer";
import { reviewEntriesReducer } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReducer";
import { analyticsReducer } from "types/Redux/analytics";
import { StoreState } from "types";

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
  //analytics state
  analyticsState: analyticsReducer,

  //handles localization through react-localize-redux utilities
  localize: localizeReducer,

  //login
  loginState: loginReducer,
  passwordResetState: passwordResetReducer,

  //project
  createProjectState: createProjectReducer,
  currentProject: projectReducer,
  exportProjectState: exportProjectReducer,

  //data entry and review entries
  treeViewState: treeViewReducer,
  reviewEntriesState: reviewEntriesReducer,
  pronunciationsState: pronunciationsReducer,

  //general cleanup tools
  goalsState: goalsReducer,

  //merge duplicates goal
  mergeDuplicateGoal: mergeDupStepReducer,

  //character inventory goal
  characterInventoryState: characterInventoryReducer,
});
