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
  MergeTreeSense,
  MergeTreeWord,
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
      const word: MergeTreeWord = JSON.parse(
        JSON.stringify(state.tree.words[action.payload.wordId])
      );
      const id = action.payload.mergeSenseId;
      const sense = { ...word.sensesGuids[id] };
      const newSensesGuids = Object.entries(word.sensesGuids).filter(
        (pair) => pair[0] !== id
      );
      newSensesGuids.splice(action.payload.index, 0, [id, sense]);

      word.sensesGuids = {};
      for (const [key, value] of newSensesGuids) {
        word.sensesGuids[key] = value;
      }

      const words = { ...state.tree.words };
      words[action.payload.wordId] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.ORDER_DUPLICATE: {
      const ref = action.payload.ref;
      const oldSensesGuids = state.tree.words[ref.wordId].sensesGuids;
      const senseGuids = oldSensesGuids[ref.mergeSenseId].filter(
        (g) => g !== ref.guid
      );
      senseGuids.splice(action.payload.index, 0, ref.guid);

      const sensesGuids = { ...oldSensesGuids };
      sensesGuids[ref.mergeSenseId] = senseGuids;

      const word: MergeTreeWord = {
        ...state.tree.words[ref.wordId],
        sensesGuids,
      };

      const words = { ...state.tree.words };
      words[ref.wordId] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.MOVE_SENSE: {
      const treeState: MergeTree = JSON.parse(JSON.stringify(state.tree));
      const words = treeState.words;
      for (const op in action.payload.src) {
        const src = action.payload.src[op];
        const dest = action.payload.dest[op];
        // only perform move if src and dest are different
        if (JSON.stringify(src) !== JSON.stringify(dest)) {
          // perform move
          const srcWordId = state.data.senses[src.guid].srcWordId;

          // tree elements need to be added to words if they don't exist
          if (!words[dest.wordId]) {
            words[dest.wordId] = {
              sensesGuids: {},
              vern: state.data.words[srcWordId].vernacular,
              plural: state.data.words[srcWordId].plural,
            };
          }

          if (!words[dest.wordId].sensesGuids[dest.mergeSenseId]) {
            words[dest.wordId].sensesGuids[dest.mergeSenseId] = [];
          }

          const destGuids = words[dest.wordId].sensesGuids[dest.mergeSenseId];
          destGuids.splice(dest.index, 0, src.guid);
          words[dest.wordId].sensesGuids[dest.mergeSenseId] = destGuids;

          // cleanup src
          const srcSensesGuids = words[src.wordId].sensesGuids;
          const srcSenseGuids = srcSensesGuids[src.mergeSenseId].filter(
            (g) => g !== src.guid
          );
          if (srcSenseGuids) {
            srcSensesGuids[src.mergeSenseId] = srcSenseGuids;
          } else {
            // if we removed last dup in a sense, remove sense from word
            delete srcSensesGuids[src.mergeSenseId];
          }
          // if we removed last sense in a word, remove word from tree
          if (Object.keys(srcSensesGuids).length === 0) {
            delete words[src.wordId];
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
      const senses: Hash<MergeTreeSense> = {};
      const wordsTree: Hash<MergeTreeWord> = {};
      action.payload.forEach((word) => {
        words[word.id] = JSON.parse(JSON.stringify(word));
        const sensesGuids: Hash<string[]> = {};
        word.senses.forEach((sense, index) => {
          senses[sense.guid] = { ...sense, srcWordId: word.id, index };
          sensesGuids[uuid()] = [sense.guid];
        });
        wordsTree[word.id] = {
          sensesGuids,
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
