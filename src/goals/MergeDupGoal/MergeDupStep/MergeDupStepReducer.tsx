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
      const word = { ...state.tree.words[action.payload.wordId] };
      word.vern = action.payload.data;

      const words = { ...state.tree.words };
      words[action.payload.wordId] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.SET_PLURAL: {
      const word = { ...state.tree.words[action.payload.wordId] };
      word.plural = action.payload.data;

      const words = { ...state.tree.words };
      words[action.payload.wordId] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.ORDER_SENSE: {
      // reorder sense
      const word = JSON.parse(
        JSON.stringify(state.tree.words[action.payload.wordId])
      );
      const senses = Object.entries(word.senses);
      const sense = { ...word.senses[action.payload.senseId] };

      senses.splice(
        senses.findIndex((s) => s[0] === action.payload.senseId),
        1
      );
      senses.splice(action.payload.order, 0, [action.payload.senseId, sense]);

      word.senses = {};
      for (const sense of senses) {
        word.senses[sense[0]] = sense[1];
      }

      const words: Hash<MergeTreeWord> = JSON.parse(
        JSON.stringify(state.tree.words)
      );
      words[action.payload.wordId] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.ORDER_DUPLICATE: {
      const ref = action.payload.ref;
      const dups = Object.entries(
        state.tree.words[ref.wordId].senses[ref.senseId]
      );
      const dup =
        state.tree.words[ref.wordId].senses[ref.senseId][ref.duplicate];

      dups.splice(
        dups.findIndex((s) => s[0] === ref.duplicate),
        1
      );
      dups.splice(action.payload.order, 0, [ref.duplicate, dup]);

      const newDups: Hash<string> = {};
      for (let dup of dups) {
        newDups[dup[0]] = dup[1];
      }

      const senses = { ...state.tree.words[ref.wordId].senses };
      senses[ref.senseId] = newDups;

      const word = { ...state.tree.words[ref.wordId], senses };

      const words = { ...state.tree.words };
      words[ref.wordId] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.MOVE_SENSE: {
      const treeState: MergeTree = JSON.parse(JSON.stringify(state.tree));
      for (const op in action.payload.src) {
        const src = action.payload.src[op];
        const dest = action.payload.dest[op];
        // only perform move if src and dest are different
        if (JSON.stringify(src) !== JSON.stringify(dest)) {
          // perform move
          const srcSenseId =
            treeState.words[src.wordId].senses[src.senseId][src.duplicate];
          const srcWordId = state.data.senses[srcSenseId].srcWordId;

          // tree elements need to be added to words if they don't exist
          if (!treeState.words[dest.wordId]) {
            treeState.words[dest.wordId] = {
              senses: {},
              vern: state.data.words[srcWordId].vernacular,
              plural: state.data.words[srcWordId].plural,
            };
          }

          if (!treeState.words[dest.wordId].senses[dest.senseId]) {
            treeState.words[dest.wordId].senses[dest.senseId] = {};
          }

          const destSense = treeState.words[dest.wordId].senses[dest.senseId];
          destSense[dest.duplicate] = srcSenseId;
          treeState.words[dest.wordId].senses[dest.senseId] = destSense;

          // cleanup src
          delete treeState.words[src.wordId].senses[src.senseId][src.duplicate];

          // if we removed last dup in a sense, remove sense from word
          if (
            Object.keys(treeState.words[src.wordId].senses[src.senseId])
              .length === 0
          ) {
            delete treeState.words[src.wordId].senses[src.senseId];
          }

          // if we removed last sense in a word, remove word from tree
          if (Object.keys(treeState.words[src.wordId].senses).length === 0) {
            delete treeState.words[src.wordId];
          }
        }
      }

      return { ...state, tree: treeState };
    }

    case MergeTreeActions.SET_DATA: {
      if (action.payload.length === 0) {
        return defaultState;
      }
      const words: Hash<Word> = {};
      const senses: Hash<TreeDataSense> = {};
      const wordsTree: Hash<MergeTreeWord> = {};
      action.payload.forEach((word) => {
        words[word.id] = JSON.parse(JSON.stringify(word));
        const treeSenses: Hash<Hash<string>> = {};
        word.senses.forEach((sense, index) => {
          const id = uuid();
          const id2 = uuid();
          senses[id] = { ...sense, srcWordId: word.id, order: index };
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
