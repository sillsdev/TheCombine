import { localizeReducer } from "react-localize-redux";
import { combineReducers, Reducer } from "redux";

import { goalsReducer } from "components/GoalTimeline/GoalsReducer";
import { loginReducer } from "components/Login/LoginReducer";
import { passwordResetReducer } from "components/PasswordReset/reducer";
import { projectReducer } from "components/Project/ProjectReducer";
import { exportProjectReducer } from "components/ProjectExport/ExportProjectReducer";
import { createProjectReducer } from "components/ProjectScreen/CreateProject/CreateProjectReducer";
import { pronunciationsReducer } from "components/Pronunciations/PronunciationsReducer";
import { treeViewReducer } from "components/TreeView/TreeViewReducer";
import { characterInventoryReducer } from "goals/CharInventoryCreation/CharacterInventoryReducer";
import { mergeDupStepReducer } from "goals/MergeDupGoal/MergeDupStep/MergeDupStepReducer";
import { reviewEntriesReducer } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesReducer";
import { StoreState } from "types";

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
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
