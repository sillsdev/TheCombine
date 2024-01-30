import { type Flag, type MergeWords } from "api/models";
import {
  type MergeData,
  type MergeTree,
  type MergeTreeReference,
  defaultData,
  defaultTree,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";

// Redux state

export interface MergeTreeState {
  data: MergeData;
  tree: MergeTree;
  mergeWords: MergeWords[];
}

export const defaultState: MergeTreeState = {
  data: defaultData,
  tree: defaultTree,
  mergeWords: [],
};

// Action payloads

export interface CombineSenseMergePayload {
  src: MergeTreeReference;
  dest: MergeTreeReference;
}

export interface FlagWordPayload {
  wordId: string;
  flag: Flag;
}

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
