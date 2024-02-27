import { Reducer, combineReducers } from "redux";

import { type StoreState } from "Redux/rootReduxTypes";
import analyticsReducer from "analytics/Redux";
import goalsReducer from "components/GoalTimeline/Redux/GoalReducer";
import loginReducer from "components/Login/Redux/LoginReducer";
import projectReducer from "components/Project/ProjectReducer";
import exportProjectReducer from "components/ProjectExport/Redux/ExportProjectReducer";
import pronunciationsReducer from "components/Pronunciations/Redux/PronunciationsReducer";
import treeViewReducer from "components/TreeView/Redux/TreeViewReducer";
import characterInventoryReducer from "goals/CharacterInventory/Redux/CharacterInventoryReducer";
import mergeDupStepReducer from "goals/MergeDuplicates/Redux/MergeDupsReducer";
import reviewEntriesReducer from "goals/ReviewEntries/Redux/ReviewEntriesReducer";

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
  //login and signup
  loginState: loginReducer,

  //project
  currentProjectState: projectReducer,
  exportProjectState: exportProjectReducer,

  //data entry and review entries goal
  treeViewState: treeViewReducer,
  reviewEntriesState: reviewEntriesReducer,
  pronunciationsState: pronunciationsReducer,

  //goal timeline and current goal
  goalsState: goalsReducer,

  //merge duplicates goal and review deferred duplicates goal
  mergeDuplicateGoal: mergeDupStepReducer,

  //character inventory goal
  characterInventoryState: characterInventoryReducer,

  //analytics state
  analyticsState: analyticsReducer,
});
