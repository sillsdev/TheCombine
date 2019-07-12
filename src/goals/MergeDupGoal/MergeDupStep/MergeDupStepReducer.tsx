import { MergeTreeAction, MergeTreeActions } from "./MergeDupStepActions";
import {
  MergeTree,
  defaultData,
  defaultTree,
  MergeData,
  MergeTreeWord,
  Hash,
  TreeDataSense
} from "./MergeDupsTree";
import { Word } from "../../../types/word";
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
    case MergeTreeActions.ORDER_SENSE: {
      // reorder sense
      let word = { ...state.tree.words[action.wordID] };
      let senses = Object.entries(word.senses);
      let sense = { ...word.senses[action.senseID] };

      senses.splice(senses.findIndex(s => s[0] === action.senseID), 1);
      senses.splice(action.order, 0, [action.senseID, sense]);

      word.senses = {};
      for (let sense of senses) {
        word.senses[sense[0]] = sense[1];
      }

      state.tree.words[action.wordID] = word;
      state.tree = { ...state.tree };
      state = { ...state };

      return state;
    }
    case MergeTreeActions.MOVE_SENSE:
      for (let op in action.payload.src) {
        let src = action.payload.src[op];
        let dest = action.payload.dest[op];
        // only perform move if src and dest are different
        if (JSON.stringify(src) !== JSON.stringify(dest)) {
          // perform move
          let srcSenseID =
            state.tree.words[src.word].senses[src.sense][src.duplicate];
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
            state.tree.words[dest.word].senses[dest.sense] = {};
          }

          let destSense = state.tree.words[dest.word].senses[dest.sense];

          destSense = { ...destSense };
          destSense[dest.duplicate] = srcSenseID;

          state.tree.words[dest.word].senses[dest.sense] = destSense;

          // cleanup src
          delete state.tree.words[src.word].senses[src.sense][src.duplicate];

          // check if we removed last dup in a sense if so remove the sense from the word

          if (
            Object.keys(state.tree.words[src.word].senses[src.sense]).length ==
            0
          ) {
            delete state.tree.words[src.word].senses[src.sense];
            state.tree.words[src.word] = { ...state.tree.words[src.word] };
          }

          // check if we removed last sense in a word if so remove the word from the tree

          if (Object.keys(state.tree.words[src.word].senses).length === 0) {
            delete state.tree.words[src.word];
            state.tree.words = { ...state.tree.words };
          }

          state.tree.words[dest.word].senses[dest.sense] = {
            ...state.tree.words[dest.word].senses[dest.sense]
          };
          state.tree.words[dest.word].senses = {
            ...state.tree.words[dest.word].senses
          };
          state.tree.words[dest.word] = { ...state.tree.words[dest.word] };
          state.tree.words = { ...state.tree.words };

          state.tree = { ...state.tree };
        }
      }

      return { ...state };
    case MergeTreeActions.SET_DATA:
      let words: { [id: string]: Word } = {};
      let senses: Hash<TreeDataSense> = {};
      let wordsTree: { [id: string]: MergeTreeWord } = {};
      action.payload.forEach(word => {
        words[word.id] = word;
        let treeSenses: Hash<Hash<string>> = {};
        word.senses.forEach((sense, index) => {
          let id = uuid();
          let id2 = uuid();
          senses[id] = { ...sense, srcWord: word.id, order: index };
          treeSenses[id2] = {};
          treeSenses[id2][uuid()] = id;
        });
        wordsTree[word.id] = {
          senses: treeSenses,
          vern: word.vernacular,
          plural: word.plural
        };
      });
      return {
        tree: { words: wordsTree },
        data: { senses, words }
      };
    case MergeTreeActions.CLEAR_TREE:
      return { tree: { ...defaultTree }, data: { ...defaultData } };
    default:
      return state;
  }
};
export default mergeDupStepReducer;
