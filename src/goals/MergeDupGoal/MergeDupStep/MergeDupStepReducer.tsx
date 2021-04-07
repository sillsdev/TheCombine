import { v4 } from "uuid";

import { StoreAction, StoreActions } from "rootActions";
import { Word } from "types/word";
import {
  MergeTreeAction,
  MergeTreeActions,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import {
  defaultTree,
  Hash,
  MergeData,
  MergeTree,
  MergeTreeSense,
  MergeTreeWord,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";

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
    case MergeTreeActions.CLEAR_TREE: {
      return defaultState;
    }

    case MergeTreeActions.COMBINE_SENSE: {
      const srcRef = action.payload.src;
      const destRef = action.payload.dest;

      // Ignore dropping a sense (or one of its sub-senses) into itself.
      if (srcRef.mergeSenseId === destRef.mergeSenseId) {
        return state;
      }

      const words: Hash<MergeTreeWord> = JSON.parse(
        JSON.stringify(state.tree.words)
      );
      const srcWordId = srcRef.wordId;
      const srcGuids = words[srcWordId].sensesGuids[srcRef.mergeSenseId];
      const destGuids = [];
      if (srcRef.order === undefined || srcGuids.length === 1) {
        destGuids.push(...srcGuids);
        delete words[srcWordId].sensesGuids[srcRef.mergeSenseId];
        if (!Object.keys(words[srcWordId].sensesGuids).length) {
          delete words[srcWordId];
        }
      } else {
        destGuids.push(srcGuids.splice(srcRef.order, 1)[0]);
      }

      words[destRef.wordId].sensesGuids[destRef.mergeSenseId].push(
        ...destGuids
      );

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.MOVE_DUPLICATE: {
      const srcRef = action.payload.ref;
      const destWordId = action.payload.destWordId;
      const words: Hash<MergeTreeWord> = JSON.parse(
        JSON.stringify(state.tree.words)
      );

      const srcWordId = srcRef.wordId;
      let mergeSenseId = srcRef.mergeSenseId;

      // Get guid of sense being restored from the sidebar.
      if (srcRef.order === undefined) {
        return state;
      }
      const srcGuids = words[srcWordId].sensesGuids[mergeSenseId];
      const guid = srcGuids.splice(srcRef.order, 1)[0];

      // Check if dropping the sense into a new word.
      if (words[destWordId] === undefined) {
        words[destWordId] = { vern: "", sensesGuids: {} };
      }

      if (srcGuids.length === 0) {
        // If there are no guids left, this is a full move.
        if (srcWordId === destWordId) {
          return state;
        }
        delete words[srcWordId].sensesGuids[mergeSenseId];
        if (!Object.keys(words[srcWordId].sensesGuids).length) {
          delete words[srcWordId];
        }
      } else {
        // Otherwise, create a new sense in the destWord.
        mergeSenseId = v4();
      }

      // Update the destWord.
      const sensesPairs = Object.entries(words[destWordId].sensesGuids);
      sensesPairs.splice(action.payload.destOrder, 0, [mergeSenseId, [guid]]);
      const newSensesGuids: Hash<string[]> = {};
      sensesPairs.forEach(([key, value]) => (newSensesGuids[key] = value));
      words[destWordId].sensesGuids = newSensesGuids;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.MOVE_SENSE: {
      const srcWordId = action.payload.wordId;
      const mergeSenseId = action.payload.mergeSenseId;
      const destWordId = action.payload.destWordId;

      if (srcWordId === destWordId) {
        return state;
      }
      const words: Hash<MergeTreeWord> = JSON.parse(
        JSON.stringify(state.tree.words)
      );

      // Check if dropping the sense into a new word.
      if (words[destWordId] === undefined) {
        if (Object.keys(words[srcWordId].sensesGuids).length === 1) {
          return state;
        }
        words[destWordId] = { vern: "", sensesGuids: {} };
      }

      // Update the destWord.
      const guids = [...words[srcWordId].sensesGuids[mergeSenseId]];
      const sensesPairs = Object.entries(words[destWordId].sensesGuids);
      sensesPairs.splice(action.payload.destOrder, 0, [mergeSenseId, guids]);
      const newSensesGuids: Hash<string[]> = {};
      sensesPairs.forEach(([key, value]) => (newSensesGuids[key] = value));
      words[destWordId].sensesGuids = newSensesGuids;

      // Cleanup the srcWord.
      delete words[srcWordId].sensesGuids[mergeSenseId];
      if (!Object.keys(words[srcWordId].sensesGuids).length) {
        delete words[srcWordId];
      }

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.ORDER_DUPLICATE: {
      const ref = action.payload.ref;

      const oldOrder = ref.order;
      const newOrder = action.payload.order;

      // Ensure the reorder is valid.
      if (oldOrder === undefined || oldOrder === newOrder) {
        return state;
      }

      // Move the guid.
      const oldSensesGuids = state.tree.words[ref.wordId].sensesGuids;
      const guids = [...oldSensesGuids[ref.mergeSenseId]];
      const guid = guids.splice(oldOrder, 1)[0];
      guids.splice(newOrder, 0, guid);

      //
      const sensesGuids = { ...oldSensesGuids };
      sensesGuids[ref.mergeSenseId] = guids;

      const word: MergeTreeWord = {
        ...state.tree.words[ref.wordId],
        sensesGuids,
      };

      const words = { ...state.tree.words };
      words[ref.wordId] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case MergeTreeActions.ORDER_SENSE: {
      const word: MergeTreeWord = JSON.parse(
        JSON.stringify(state.tree.words[action.payload.wordId])
      );

      // Convert the Hash<string[]> to an array to expose the order.
      const sensePairs = Object.entries(word.sensesGuids);

      const mergeSenseId = action.payload.mergeSenseId;
      const oldOrder = sensePairs.findIndex((p) => p[0] === mergeSenseId);
      const newOrder = action.payload.order;

      // Ensure the move is valid.
      if (oldOrder === -1 || newOrder === undefined || oldOrder === newOrder) {
        return state;
      }

      // Move the sense pair to its new place.
      const pair = sensePairs.splice(oldOrder, 1)[0];
      sensePairs.splice(newOrder, 0, pair);

      // Rebuild the Hash<string[]>.
      word.sensesGuids = {};
      for (const [key, value] of sensePairs) {
        word.sensesGuids[key] = value;
      }

      const words = { ...state.tree.words };
      words[action.payload.wordId] = word;

      return { ...state, tree: { ...state.tree, words } };
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
        word.senses.forEach((sense, order) => {
          senses[sense.guid] = { ...sense, srcWordId: word.id, order };
          sensesGuids[v4()] = [sense.guid];
        });
        wordsTree[word.id] = {
          sensesGuids,
          vern: word.vernacular,
        };
      });
      return {
        ...state,
        tree: { ...state.tree, words: wordsTree },
        data: { senses, words },
      };
    }

    case MergeTreeActions.SET_SIDEBAR: {
      const sidebar = action.payload;
      return { ...state, tree: { ...state.tree, sidebar } };
    }

    case MergeTreeActions.SET_VERNACULAR: {
      const word = { ...state.tree.words[action.payload.wordId] };
      word.vern = action.payload.vern;

      const words = { ...state.tree.words };
      words[action.payload.wordId] = word;

      return { ...state, tree: { ...state.tree, words } };
    }

    case StoreActions.RESET: {
      return defaultState;
    }

    default: {
      return state;
    }
  }
};
