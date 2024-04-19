import { type Flag, type MergeWords } from "api/models";
import {
  type MergeData,
  type MergeTree,
  type MergeTreeReference,
  defaultData,
  defaultTree,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { type Hash } from "types/hash";

// Redux state

/** `.counts` is a dictionary of all audio counts of the words being merged:
 * - key: id of a word in the set of potential duplicates
 * - value: number of audio pronunciations on the word
 *
 * `.moves` is a dictionary of words receiving the audio of other words:
 * - key: id of a word receiving audio
 * - value: array of ids of words whose audio is being received */
export interface MergeAudio {
  counts: Hash<number>;
  moves: Hash<string[]>;
}

export const defaultAudio: MergeAudio = {
  counts: {},
  moves: {},
};

export interface MergeTreeState {
  data: MergeData;
  tree: MergeTree;
  audio: MergeAudio;
  mergeWords: MergeWords[];
}

export const defaultState: MergeTreeState = {
  data: defaultData,
  tree: defaultTree,
  audio: defaultAudio,
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
