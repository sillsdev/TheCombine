import { StoreAction, StoreActions } from "rootActions";
import { Word } from "types/word";
import { uuid } from "utilities";
import {
  MergeTreeAction,
  MergeTreeActions,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import {
  Hash,
  MergeData,
  MergeTree,
  MergeTreeWord,
  TreeDataSense,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";

const defaultTree = { words: {} };
const defaultData = { words: {}, senses: {} };
export const defaultState: MergeTreeState = {
  data: defaultData,
  tree: defaultTree,
};

export interface MergeTreeState {
  data: MergeData;
  tree: MergeTree;
}

export const mergeDupStepReducer = (
  state: MergeTreeState = defaultState, //createStore() calls each reducer with undefined state
  action: StoreAction | MergeTreeAction
): MergeTreeState => {
  switch (action.type) {
    case MergeTreeActions.SET_VERNACULAR: {
      const word = { ...state.tree.words[action.payload.wordID] };
      word.vern = action.payload.data;

      const words = { ...state.tree.words };
      words[action.payload.wordID] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.SET_PLURAL: {
      const word = { ...state.tree.words[action.payload.wordID] };
      word.plural = action.payload.data;

      const words = { ...state.tree.words };
      words[action.payload.wordID] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.ORDER_SENSE: {
      // reorder sense
      let word = JSON.parse(
        JSON.stringify(state.tree.words[action.payload.wordID])
      );
      let senses = Object.entries(word.senses);
      let sense = { ...word.senses[action.payload.senseID] };

      senses.splice(
        senses.findIndex((s) => s[0] === action.payload.senseID),
        1
      );
      senses.splice(action.payload.order, 0, [action.payload.senseID, sense]);

      word.senses = {};
      for (let sense of senses) {
        word.senses[sense[0]] = sense[1];
      }

      const words: Hash<MergeTreeWord> = JSON.parse(
        JSON.stringify(state.tree.words)
      );
      words[action.payload.wordID] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.ORDER_DUPLICATE: {
      let ref = action.payload.ref;
      let dups = Object.entries(state.tree.words[ref.word].senses[ref.sense]);
      let dup = state.tree.words[ref.word].senses[ref.sense][ref.duplicate];

      dups.splice(
        dups.findIndex((s) => s[0] === ref.duplicate),
        1
      );
      dups.splice(action.payload.order, 0, [ref.duplicate, dup]);

      let newDups: Hash<string> = {};

      for (let dup of dups) {
        newDups[dup[0]] = dup[1];
      }

      const senses = { ...state.tree.words[ref.word].senses };
      senses[ref.sense] = newDups;

      const word = { ...state.tree.words[ref.word], senses };

      const words = { ...state.tree.words };
      words[ref.word] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.MOVE_SENSE: {
      let treeState: MergeTree = JSON.parse(JSON.stringify(state.tree));
      for (let op in action.payload.src) {
        let src = action.payload.src[op];
        let dest = action.payload.dest[op];
        // only perform move if src and dest are different
        if (JSON.stringify(src) !== JSON.stringify(dest)) {
          // perform move
          let srcSenseID =
            treeState.words[src.word].senses[src.sense][src.duplicate];
          let srcWordID = state.data.senses[srcSenseID].srcWord;

          // tree elements need to be added to words if they don't exist
          if (!treeState.words[dest.word]) {
            treeState.words[dest.word] = {
              senses: {},
              vern: state.data.words[srcWordID].vernacular,
              plural: state.data.words[srcWordID].plural,
            };
          }

          if (!treeState.words[dest.word].senses[dest.sense]) {
            treeState.words[dest.word].senses[dest.sense] = {};
          }

          let destSense = treeState.words[dest.word].senses[dest.sense];
          destSense[dest.duplicate] = srcSenseID;
          treeState.words[dest.word].senses[dest.sense] = destSense;

          // cleanup src
          delete treeState.words[src.word].senses[src.sense][src.duplicate];

          // if we removed last dup in a sense, remove sense from word
          if (
            Object.keys(treeState.words[src.word].senses[src.sense]).length ===
            0
          ) {
            delete treeState.words[src.word].senses[src.sense];
          }

          // if we removed last sense in a word, remove word from tree
          if (Object.keys(treeState.words[src.word].senses).length === 0) {
            delete treeState.words[src.word];
          }
        }
      }

      return { ...state, tree: treeState };
    }

    case MergeTreeActions.SET_DATA: {
      if (action.payload.length === 0) {
        return defaultState;
      }
      let words: Hash<Word> = {};
      let senses: Hash<TreeDataSense> = {};
      let wordsTree: Hash<MergeTreeWord> = {};
      action.payload.forEach((word) => {
        words[word.id] = JSON.parse(JSON.stringify(word));
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
          plural: word.plural,
        };
      });
      return {
        ...state,
        tree: { words: wordsTree },
        data: { senses, words },
      };
    }

    case MergeTreeActions.CLEAR_TREE: {
      return defaultState;
    }

    case StoreActions.RESET: {
      return defaultState;
    }

    default: {
      return state;
    }
  }
};
