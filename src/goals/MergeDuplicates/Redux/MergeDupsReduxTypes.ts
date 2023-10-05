import { Flag } from "api/models";
import {
  MergeData,
  MergeTree,
  MergeTreeReference,
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
}

export interface MoveSensePayload {
  ref: MergeTreeReference;
  destWordId: string;
  destOrder: number;
}

export interface OrderSensePayload {
  ref: MergeTreeReference;
  order: number;
}

export interface SetVernacularPayload {
  wordId: string;
  vern: string;
}
