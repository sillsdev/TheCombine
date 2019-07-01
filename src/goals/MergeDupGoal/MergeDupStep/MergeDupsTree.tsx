import * as Data from '../../../types/word';

export interface MergeData {
  words: {[wordID: string]: Data.Word};
  senses: {[senseID: string]: Data.Sense & {srcWord: string}};
}

export interface MergeTreeReference {
  word: string;
  sense: string;
  duplicate: string;
}

export interface MergeTreeSense {
  dups: {[dupID: string]: string};
}

export interface MergeTreeWord {
  senses: {[senseID: string]: string};
  vern: string;
  plural: string;
}

export interface MergeTree {
  senses: {[senseID: string]: MergeTreeSense};
  words: {[wordID: string]: MergeTreeWord};
}

export const defaultTree = {
  senses: {},
  words: {}
};

export const defaultData = {
  words: {},
  senses: {}
}
