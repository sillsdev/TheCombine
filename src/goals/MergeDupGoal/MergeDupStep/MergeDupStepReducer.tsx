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
      const word: MergeTreeWord = JSON.parse(
        JSON.stringify(state.tree.words[action.payload.wordId])
      );
      const senses = Object.entries(word.sensesGuids);
      const id = action.payload.mergeSenseId;
      const sense = { ...word.sensesGuids[id] };

      senses.splice(
        senses.findIndex((s) => s[0] === id),
        1
      );
      senses.splice(action.payload.order, 0, [id, sense]);

      word.sensesGuids = {};
      for (const sense of senses) {
        word.sensesGuids[sense[0]] = sense[1];
      }

      const words: Hash<MergeTreeWord> = JSON.parse(
        JSON.stringify(state.tree.words)
      );
      words[action.payload.wordId] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.ORDER_DUPLICATE: {
      const ref = action.payload.ref;
      const senseGuids =
        state.tree.words[ref.wordId].sensesGuids[ref.mergeSenseId];
      const idGuidPairs = Object.entries(senseGuids);

      const dupIndex = idGuidPairs.findIndex((p) => p[0] === ref.duplicateId);
      idGuidPairs.splice(dupIndex, 1);
      idGuidPairs.splice(action.payload.order, 0, [
        ref.duplicateId,
        senseGuids[ref.mergeSenseId],
      ]);

      const newDupIds: Hash<string> = {};
      for (const pair of idGuidPairs) {
        newDupIds[pair[0]] = pair[1];
      }

      const senses = { ...state.tree.words[ref.wordId].sensesGuids };
      senses[ref.mergeSenseId] = newDupIds;

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
          const srcSenseGuid =
            treeState.words[src.wordId].sensesGuids[src.mergeSenseId][
              src.duplicateId
            ];
          const srcWordId = state.data.senses[srcSenseGuid].srcWordId;

          // tree elements need to be added to words if they don't exist
          if (!treeState.words[dest.wordId]) {
            treeState.words[dest.wordId] = {
              sensesGuids: {},
              vern: state.data.words[srcWordId].vernacular,
              plural: state.data.words[srcWordId].plural,
            };
          }

          if (!treeState.words[dest.wordId].sensesGuids[dest.mergeSenseId]) {
            treeState.words[dest.wordId].sensesGuids[dest.mergeSenseId] = {};
          }

          const destSense =
            treeState.words[dest.wordId].sensesGuids[dest.mergeSenseId];
          destSense[dest.duplicateId] = srcSenseGuid;
          treeState.words[dest.wordId].sensesGuids[
            dest.mergeSenseId
          ] = destSense;

          // cleanup src
          delete treeState.words[src.wordId].sensesGuids[src.mergeSenseId][
            src.duplicateId
          ];

          // if we removed last dup in a sense, remove sense from word
          if (
            Object.keys(
              treeState.words[src.wordId].sensesGuids[src.mergeSenseId]
            ).length === 0
          ) {
            delete treeState.words[src.wordId].sensesGuids[src.mergeSenseId];
          }

          // if we removed last sense in a word, remove word from tree
          if (
            Object.keys(treeState.words[src.wordId].sensesGuids).length === 0
          ) {
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
        const sensesGuids: Hash<Hash<string>> = {};
        word.senses.forEach((sense, index) => {
          senses[sense.guid] = { ...sense, srcWordId: word.id, order: index };
          const newSenseGuid: Hash<string> = {};
          newSenseGuid[uuid()] = sense.guid;
          sensesGuids[uuid()] = newSenseGuid;
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
