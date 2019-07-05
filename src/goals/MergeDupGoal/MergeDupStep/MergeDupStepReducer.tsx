import { MergeTreeAction, MergeTreeActions } from "./MergeDupStepActions";
import {
  MergeTree,
  defaultData,
  defaultTree,
  MergeData,
  MergeTreeWord,
  MergeTreeSense,
  Hash,
  TreeDataSense
} from "./MergeDupsTree";
import { Word, Sense } from "../../../types/word";
import { uuid } from "../../../utilities";

export const defaultState: MergeTreeState = {
  data: defaultData,
  tree: defaultTree
};

export interface MergeTreeState {
  data: MergeData;
  tree: MergeTree;
}

const mergeDupStepReducer = (
  state: MergeTreeState = defaultState, //createStore() calls each reducer with undefined state
  action: MergeTreeAction
): MergeTreeState => {
  switch (action.type) {
    case MergeTreeActions.SET_VERNACULAR:
      return state;
    case MergeTreeActions.SET_PLURAL:
      return state;
    case MergeTreeActions.MOVE_SENSE:
      let { src, dest } = action.payload;
      // only perform move if src and dest are different
      if (JSON.stringify(src) != JSON.stringify(dest)) {
        console.log(src);
        console.log(dest);
        // perform move
        let senseID = state.tree.words[src.word].senses[src.sense];
        let srcSenseID = state.tree.senses[senseID].dups[src.duplicate];
        let srcWordID = state.data.senses[srcSenseID].srcWord;

        // tree elements need to be added to words if they don't exist
        if (!state.tree.words[dest.word]) {
          state.tree.words = { ...state.tree.words };
          state.tree.words[dest.word] = {
            senses: {},
            vern: state.data.words[srcWordID].vernacular,
            plural: state.data.words[srcWordID].plural
          };
        }

        if (!state.tree.words[dest.word].senses[dest.sense]) {
          state.tree.words = { ...state.tree.words };
          state.tree.words[dest.word].senses[dest.sense] = uuid();
        }

        let destSenseID = state.tree.words[dest.word].senses[dest.sense];

        if (!state.tree.senses[destSenseID]) {
          state.tree.senses = { ...state.tree.senses };
          state.tree.senses[destSenseID] = {
            dups: {}
          };
        }

        state.tree.senses = { ...state.tree.senses };
        state.tree.senses[destSenseID].dups[dest.duplicate] = srcSenseID;

        // cleanup src
        delete state.tree.senses[senseID].dups[src.duplicate];

        // check if we removed last dup in a sense if so remove the sense from the word

        if (Object.keys(state.tree.senses[senseID].dups).length == 0) {
          delete state.tree.senses[senseID];
          delete state.tree.words[src.word].senses[src.sense];
          state.tree.words[src.word] = { ...state.tree.words[src.word] };
        }

        // check if we removed last sense in a word if so remove the word from the tree

        if (Object.keys(state.tree.words[src.word].senses).length == 0) {
          delete state.tree.words[src.word];
        }

        state.tree.senses[destSenseID] = { ...state.tree.senses[destSenseID] };
        state.tree.senses = { ...state.tree.senses };
        state.tree.words = { ...state.tree.words };

        state.tree = { ...state.tree };
      }

      return { ...state };
    case MergeTreeActions.SET_DATA:
      let words: { [id: string]: Word } = {};
      let senses: Hash<TreeDataSense> = {};
      let wordsTree: { [id: string]: MergeTreeWord } = {};
      let sensesTree: { [id: string]: MergeTreeSense } = {};

      action.payload.map(word => {
        words[word.id] = word;
        let treeSenses: { [id: string]: string } = {};
        word.senses.map((sense, index) => {
          let id = uuid();
          let id2 = uuid();
          senses[id] = { ...sense, srcWord: word.id, order: index };
          let mergeSense: MergeTreeSense = { dups: {} };
          mergeSense.dups[uuid()] = id;
          sensesTree[id2] = mergeSense;
          treeSenses[uuid()] = id2;
        });
        wordsTree[word.id] = {
          senses: treeSenses,
          vern: word.vernacular,
          plural: word.plural
        };
      });

      return {
        tree: { senses: sensesTree, words: wordsTree },
        data: { senses, words }
      };
    case MergeTreeActions.CLEAR_TREE:
      return { tree: { ...defaultTree }, data: { ...defaultData } };
    default:
      return state;
  }
};
export default mergeDupStepReducer;
