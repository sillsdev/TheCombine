import { combineReducers, Reducer } from "redux";

import goalsReducer from "components/GoalTimeline/Redux/GoalReducer";
import loginReducer from "components/Login/Redux/LoginReducer";
import { projectReducer } from "components/Project/ProjectReducer";
import exportProjectReducer from "components/ProjectExport/Redux/ExportProjectReducer";
import { pronunciationsReducer } from "components/Pronunciations/Redux/PronunciationsReducer";
import treeViewReducer from "components/TreeView/Redux/TreeViewReducer";
import { characterInventoryReducer } from "goals/CharacterInventory/Redux/CharacterInventoryReducer";
import mergeDupStepReducer from "goals/MergeDuplicates/Redux/MergeDupsReducer";
import { reviewEntriesReducer } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReducer";
import { StoreState } from "types";
import { analyticsReducer } from "types/Redux/analytics";

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
  //login
  loginState: loginReducer,

  //project
  currentProjectState: projectReducer,
  exportProjectState: exportProjectReducer,

  //data entry and review entries
  treeViewState: treeViewReducer,
  reviewEntriesState: reviewEntriesReducer,
  pronunciationsState: pronunciationsReducer,

  //goal timeline and current goal
  goalsState: goalsReducer,

  //merge duplicates goal
  mergeDuplicateGoal: mergeDupStepReducer,

  //character inventory goal
  characterInventoryState: characterInventoryReducer,

  //analytics state
  analyticsState: analyticsReducer,
});
