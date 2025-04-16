import { type Action } from "redux";
import { type ThunkDispatch } from "redux-thunk";

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
  type FindDupsState,
  defaultState as findDupsState,
} from "goals/MergeDuplicates/FindDups/Redux/FindDupsReduxTypes";
import {
  type MergeTreeState,
  defaultState as mergeDuplicateGoal,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import {
  type GoalsState,
  defaultState as goalsState,
} from "goals/Redux/GoalReduxTypes";
import {
  type AnalyticsState,
  defaultState as analyticsState,
} from "types/Redux/analyticsReduxTypes";

/** Redux store structure */
export interface StoreState {
  //login
  loginState: LoginState;

  //project
  currentProjectState: CurrentProjectState;
  exportProjectState: ExportProjectState;

  //data entry and review entries
  treeViewState: TreeViewState;
  pronunciationsState: PronunciationsState;

  //goal timeline and current goal
  goalsState: GoalsState;

  //merge duplicates goal
  findDuplicates: FindDupsState;
  mergeDuplicateGoal: MergeTreeState;

  //character inventory goal
  characterInventoryState: CharacterInventoryState;

  //analytics state
  analyticsState: AnalyticsState;
}

/** Default values for the Redux store */
export const defaultState: StoreState = {
  loginState: { ...loginState },
  currentProjectState: { ...currentProjectState },
  exportProjectState: { ...exportProjectState },
  treeViewState: { ...treeViewState },
  pronunciationsState: { ...pronunciationsState },
  goalsState: { ...goalsState },
  findDuplicates: { ...findDupsState },
  mergeDuplicateGoal: { ...mergeDuplicateGoal },
  characterInventoryState: { ...characterInventoryState },
  analyticsState: { ...analyticsState },
};

export interface ActionWithPayload<T> extends Action {
  payload: T;
}

// https://redux.js.org/usage/usage-with-typescript#type-checking-redux-thunks
// suggests a custom general type for ThunkAction,
// so in like fashion, here's one for ThunkDispatch:
export type StoreStateDispatch = ThunkDispatch<StoreState, any, Action>;
