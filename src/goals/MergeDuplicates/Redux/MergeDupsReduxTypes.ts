import { Flag, MergeWords } from "api/models";
import {
  MergeData,
  MergeDeleted,
  MergeTree,
  MergeTreeReference,
  defaultData,
  defaultDeleted,
  defaultTree,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";

export interface CombineSenseMergePayload {
  src: MergeTreeReference;
  dest: MergeTreeReference;
}

export interface FlagWordPayload {
  wordId: string;
  flag: Flag;
}

export interface MergeTreeState {
  data: MergeData;
  tree: MergeTree;
  deleted: MergeDeleted;
  mergeWords: MergeWords[];
}

export const defaultState: MergeTreeState = {
  data: defaultData,
  tree: defaultTree,
  deleted: defaultDeleted,
  mergeWords: [],
};

export interface MoveSensePayload extends OrderSensePayload {
  destWordId: string;
}

export interface OrderSensePayload {
  src: MergeTreeReference;
  destOrder: number;
}

export interface SetVernacularPayload {
  wordId: string;
  vern: string;
}
