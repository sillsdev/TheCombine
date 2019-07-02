import {MergeTreeAction, MergeTreeActions} from './actions';
import {
  MergeTree,
  defaultData,
  defaultTree,
  MergeData,
  MergeTreeWord,
  MergeTreeSense,
} from './MergeDupsTree';
import {Word, Sense} from '../../../types/word';
import {uuid} from '../../../utilities';

export const defaultState: MergeTreeState = {
  data: defaultData,
  tree: defaultTree,
};

export interface MergeTreeState {
  data: MergeData;
  tree: MergeTree;
}

const mergeDupStepReducer = (
  state: MergeTreeState = defaultState, //createStore() calls each reducer with undefined state
  action: MergeTreeAction,
): MergeTreeState => {
  switch (action.type) {
    // This is clearly the best reducer ever written
    case MergeTreeActions.SET_VERNACULAR:
      return state;
    case MergeTreeActions.SET_PLURAL:
      return state;
    case MergeTreeActions.MOVE_SENSE:
      return state;
    case MergeTreeActions.SET_SENSE:
      return state;
    case MergeTreeActions.SET_DATA:
      let words: {[id: string]: Word} = {};
      let senses: {[id: string]: Sense & {srcWord: string}} = {};
      let wordsTree: {[id: string]: MergeTreeWord} = {};
      let sensesTree: {[id: string]: MergeTreeSense} = {};

      action.payload.map(word => {
        words[word.id] = word;
        let treeSenses: {[id: string]: string} = {};
        word.senses.map(sense => {
          let id = uuid();
          let id2 = uuid();
          senses[id] = {...sense, srcWord: word.id};
          let mergeSense: MergeTreeSense = {dups: {}};
          mergeSense.dups[uuid()] = id;
          sensesTree[id2] = mergeSense;
          treeSenses[uuid()] = id2;
        });
        wordsTree[word.id] = {
          senses: treeSenses,
          vern: word.vernacular,
          plural: word.plural,
        };
      });

      return {
        tree: {senses: sensesTree, words: wordsTree},
        data: {senses, words},
      };
    default:
      return state;
  }
};
export default mergeDupStepReducer;
