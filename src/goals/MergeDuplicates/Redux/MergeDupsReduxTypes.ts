import { type Flag, type MergeWords, type Word } from "api/models";
import {
  type MergeData,
  type MergeTree,
  type MergeTreeReference,
  defaultData,
  defaultTree,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { type Hash } from "types/hash";

// Redux state

export interface MergeAudio {
  counts: Hash<number>;
  moves: Hash<string[]>;
}

export const defaultAudio: MergeAudio = {
  counts: {},
  moves: {},
};

export interface MergeDeleted {
  senseGuids: string[];
  words: Word[];
}

export const defaultDeleted: MergeDeleted = {
  senseGuids: [],
  words: [],
};

export interface MergeTreeState {
  data: MergeData;
  tree: MergeTree;
  audio: MergeAudio;
  deleted: MergeDeleted;
  mergeWords: MergeWords[];
}

export const defaultState: MergeTreeState = {
  data: defaultData,
  tree: defaultTree,
  audio: defaultAudio,
  deleted: defaultDeleted,
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
