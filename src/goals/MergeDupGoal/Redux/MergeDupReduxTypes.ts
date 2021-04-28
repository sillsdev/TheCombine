import {
  MergeData,
  MergeTree,
  MergeTreeReference,
  Sidebar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { Word } from "types/word";

export enum MergeTreeActions {
  CLEAR_TREE = "CLEAR_TREE",
  COMBINE_SENSE = "COMBINE_SENSE",
  MOVE_DUPLICATE = "MOVE_DUPLICATE",
  MOVE_SENSE = "MOVE_SENSE",
  ORDER_DUPLICATE = "ORDER_DUPLICATE",
  ORDER_SENSE = "ORDER_SENSE",
  SET_DATA = "SET_DATA",
  SET_SIDEBAR = "SET_SIDEBAR",
  SET_VERNACULAR = "SET_VERNACULAR",
}

export interface MergeTreeState {
  data: MergeData;
  tree: MergeTree;
}

export interface ClearTreeMergeAction {
  type: MergeTreeActions.CLEAR_TREE;
}

export interface CombineSenseMergeAction {
  type: MergeTreeActions.COMBINE_SENSE;
  payload: { src: MergeTreeReference; dest: MergeTreeReference };
}

export interface MoveDuplicateMergeAction {
  type: MergeTreeActions.MOVE_DUPLICATE;
  payload: { ref: MergeTreeReference; destWordId: string; destOrder: number };
}

export interface MoveSenseMergeAction {
  type: MergeTreeActions.MOVE_SENSE;
  payload: {
    wordId: string;
    mergeSenseId: string;
    destWordId: string;
    destOrder: number;
  };
}

export interface OrderDuplicateMergeAction {
  type: MergeTreeActions.ORDER_DUPLICATE;
  payload: { ref: MergeTreeReference; order: number };
}

export interface OrderSenseMergeAction {
  type: MergeTreeActions.ORDER_SENSE;
  payload: MergeTreeReference;
}

export interface SetDataMergeAction {
  type: MergeTreeActions.SET_DATA;
  payload: Word[];
}

export interface SetSidebarMergeAction {
  type: MergeTreeActions.SET_SIDEBAR;
  payload: Sidebar;
}

export interface SetVernacularMergeAction {
  type: MergeTreeActions.SET_VERNACULAR;
  payload: { wordId: string; vern: string };
}

export type MergeTreeAction =
  | ClearTreeMergeAction
  | CombineSenseMergeAction
  | MoveDuplicateMergeAction
  | MoveSenseMergeAction
  | OrderDuplicateMergeAction
  | OrderSenseMergeAction
  | SetDataMergeAction
  | SetSidebarMergeAction
  | SetVernacularMergeAction;
