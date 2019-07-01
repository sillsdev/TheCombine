import * as Data from '../../../types/word';



export namespace MergeTree {
  export interface MergeData {
    words: Data.Word[];
    senses: Data.Sense & {srcWord: number}[];
  }

  export interface Reference {
    word: number;
    sense: number;
    duplicate: number;
  }

  export interface Sense {
    dups: number[];
  }

  export interface Word {
    senses: number[];
    vern: string;
    plural: string;
  }

  export interface Tree {
    senses: Sense[];
    words: Word[];
  }

  export const defaultTree = {
    senses: [],
    words: []
  };

  export const defaultData = {
    words: [],
    senses: []
  }
}
