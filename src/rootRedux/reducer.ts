import { type Reducer, combineReducers } from "redux";

import loginReducer from "components/Login/Redux/LoginReducer";
import projectReducer from "components/Project/ProjectReducer";
import exportProjectReducer from "components/ProjectExport/Redux/ExportProjectReducer";
import pronunciationsReducer from "components/Pronunciations/Redux/PronunciationsReducer";
import treeViewReducer from "components/TreeView/Redux/TreeViewReducer";
import characterInventoryReducer from "goals/CharacterInventory/Redux/CharacterInventoryReducer";
import mergeDupStepReducer from "goals/MergeDuplicates/Redux/MergeDupsReducer";
import goalsReducer from "goals/Redux/GoalReducer";
import { type StoreState } from "rootRedux/types";
import analyticsReducer from "types/Redux/analytics";

export const rootReducer: Reducer<StoreState> = combineReducers({
  //login and signup
  loginState: loginReducer,

  //project
  currentProjectState: projectReducer,
  exportProjectState: exportProjectReducer,

  //data entry and review entries goal
  treeViewState: treeViewReducer,
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
