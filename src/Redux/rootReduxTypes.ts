import { type Action } from "redux";
import { type ThunkDispatch } from "redux-thunk";

import {
  type AnalyticsState,
  defaultState as analyticsState,
} from "analytics/Redux/analyticsReduxTypes";
import {
  type GoalsState,
  defaultState as goalsState,
} from "components/GoalTimeline/Redux/GoalReduxTypes";
import {
  type LoginState,
  defaultState as loginState,
} from "components/Login/Redux/LoginReduxTypes";
import {
  type CurrentProjectState,
  defaultState as currentProjectState,
} from "components/Project/ProjectReduxTypes";
import {
  type ExportProjectState,
  defaultState as exportProjectState,
} from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import {
  type PronunciationsState,
  defaultState as pronunciationsState,
} from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import {
  type TreeViewState,
  defaultState as treeViewState,
} from "components/TreeView/Redux/TreeViewReduxTypes";
import {
  type CharacterInventoryState,
  defaultState as characterInventoryState,
} from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import {
  type MergeTreeState,
  defaultState as mergeDuplicateGoal,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import {
  type ReviewEntriesState,
  defaultState as reviewEntriesState,
} from "goals/ReviewEntries/Redux/ReviewEntriesReduxTypes";

//root store structure
export interface StoreState {
  //login
  loginState: LoginState;

  //project
  currentProjectState: CurrentProjectState;
  exportProjectState: ExportProjectState;

  //data entry and review entries
  treeViewState: TreeViewState;
  reviewEntriesState: ReviewEntriesState;
  pronunciationsState: PronunciationsState;

  //goal timeline and current goal
  goalsState: GoalsState;

  //merge duplicates goal
  mergeDuplicateGoal: MergeTreeState;

  //character inventory goal
  characterInventoryState: CharacterInventoryState;

  //analytics state
  analyticsState: AnalyticsState;
}

export const defaultState: StoreState = {
  loginState: { ...loginState },
  currentProjectState: { ...currentProjectState },
  exportProjectState: { ...exportProjectState },
  treeViewState: { ...treeViewState },
  reviewEntriesState: { ...reviewEntriesState },
  pronunciationsState: { ...pronunciationsState },
  goalsState: { ...goalsState },
  mergeDuplicateGoal: { ...mergeDuplicateGoal },
  characterInventoryState: { ...characterInventoryState },
  analyticsState: { ...analyticsState },
};

export interface ActionWithPayload<T> extends Action {
  payload: T;
}

// https://redux.js.org/recipes/usage-with-typescript#usage-with-redux-thunk
// suggests a custom general type for ThunkAction,
// so in like fashion, here's one for ThunkDispatch:
export type StoreStateDispatch = ThunkDispatch<StoreState, any, Action>;
