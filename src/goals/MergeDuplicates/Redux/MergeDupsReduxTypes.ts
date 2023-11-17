import { Flag, MergeWords } from "api/models";
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
  mergeWords: MergeWords[];
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
