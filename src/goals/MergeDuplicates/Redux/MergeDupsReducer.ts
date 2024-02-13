import { createSlice } from "@reduxjs/toolkit";
import { v4 } from "uuid";

import { type Word } from "api/models";
import {
  type MergeTreeSense,
  type MergeTreeWord,
  convertSenseToMergeTreeSense,
  convertWordToMergeTreeWord,
  defaultData,
  defaultSidebar,
  defaultTree,
  newMergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import {
  defaultAudio,
  defaultState,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import {
  combineIntoFirstSense,
  createMergeChildren,
  createMergeParent,
  gatherWordSenses,
  getDeletedMergeWords,
  isEmptyMerge,
} from "goals/MergeDuplicates/Redux/reducerUtilities";
import { StoreActionTypes } from "rootActions";
import { type Hash } from "types/hash";

const mergeDuplicatesSlice = createSlice({
  name: "mergeDupStepReducer",
  initialState: defaultState,
  reducers: {
    clearMergeWordsAction: (state) => {
      state.mergeWords = [];
    },

    clearTreeAction: () => {
      return defaultState;
    },

    combineSenseAction: (state, action) => {
      const srcRef = action.payload.src;
      const destRef = action.payload.dest;

      // Ignore dropping a sense (or one of its sub-senses) into itself.
      if (srcRef.mergeSenseId !== destRef.mergeSenseId) {
        const words = state.tree.words;
        const srcWordId = srcRef.wordId;
        const srcGuids = words[srcWordId].sensesGuids[srcRef.mergeSenseId];
        const destGuids: string[] = [];
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
        state.tree.words = words;
      }
    },

    deleteSenseAction: (state, action) => {
      const srcRef = action.payload;
      const srcWordId = srcRef.wordId;
      const { deletedSenseGuids, words } = state.tree;

      const sensesGuids = words[srcWordId].sensesGuids;
      const sGuids = sensesGuids[srcRef.mergeSenseId];
      if (srcRef.order !== undefined) {
        deletedSenseGuids.push(sGuids[srcRef.order]);
        sGuids.splice(srcRef.order, 1);
        if (!sGuids.length) {
          delete sensesGuids[srcRef.mergeSenseId];
        }
      } else {
        deletedSenseGuids.push(...sGuids);
        delete sensesGuids[srcRef.mergeSenseId];
      }
      if (!Object.keys(words[srcWordId].sensesGuids).length) {
        delete state.audio.moves[srcWordId];
        delete words[srcWordId];
      }

      const sidebar = state.tree.sidebar;
      // If the sense is being deleted from the words column
      // and the sense is also shown in the sidebar,
      // then reset the sidebar.
      if (
        sidebar.wordId === srcRef.wordId &&
        sidebar.mergeSenseId === srcRef.mergeSenseId &&
        srcRef.order === undefined
      ) {
        state.tree.sidebar = defaultSidebar;
      }
    },

    flagWordAction: (state, action) => {
      state.tree.words[action.payload.wordId].flag = action.payload.flag;
    },

    getMergeWordsAction: (state) => {
      const dataWords = Object.values(state.data.words);
      const deletedSenseGuids = state.tree.deletedSenseGuids;

      // First handle words with all senses deleted.
      state.mergeWords = getDeletedMergeWords(dataWords, deletedSenseGuids);

      // Then build the rest of the mergeWords.

      // Gather all senses (accessibility will be updated as mergeWords are built).
      const wordTreeSenses = gatherWordSenses(dataWords, deletedSenseGuids);
      const allSenses = Object.values(wordTreeSenses).flatMap((mergeSenses) =>
        mergeSenses.map((ms) => ms.sense)
      );

      // Build one merge word per column.
      for (const wordId in state.tree.words) {
        // Get from tree the basic info for this column.
        const mergeWord = state.tree.words[wordId];

        // Get from data all senses in this column.
        const mergeSenses = Object.values(mergeWord.sensesGuids).map((guids) =>
          guids.map((g) => state.data.senses[g])
        );

        // Update those senses in the set of all senses.
        mergeSenses.forEach((senses) => {
          const sensesToUpdate = senses.map(
            (s) => wordTreeSenses[s.srcWordId][s.order]
          );
          combineIntoFirstSense(sensesToUpdate);
        });

        // Check if nothing to merge.
        const wordToUpdate = state.data.words[wordId];
        if (isEmptyMerge(wordToUpdate, mergeWord)) {
          continue;
        }

        // Create merge words.
        const children = createMergeChildren(
          mergeSenses,
          state.audio.moves[wordId]
        );
        const parent = createMergeParent(wordToUpdate, mergeWord, allSenses);
        state.mergeWords.push({ parent, children, deleteOnly: false });
      }
    },

    moveSenseAction: (state, action) => {
      const srcWordId = action.payload.src.wordId;
      const destWordId = action.payload.destWordId;
      const srcOrder = action.payload.src.order;
      if (srcOrder === undefined && srcWordId !== destWordId) {
        const mergeSenseId = action.payload.src.mergeSenseId;

        const words = state.tree.words;

        // Check if dropping the sense into a new word.
        if (words[destWordId] === undefined) {
          if (Object.keys(words[srcWordId].sensesGuids).length === 1) {
            return;
          }
          words[destWordId] = newMergeTreeWord();
        }

        // Update the destWord.
        const guids = words[srcWordId].sensesGuids[mergeSenseId];
        const sensesPairs = Object.entries(words[destWordId].sensesGuids);
        sensesPairs.splice(action.payload.destOrder, 0, [mergeSenseId, guids]);
        const newSensesGuids: Hash<string[]> = {};
        sensesPairs.forEach(([key, value]) => (newSensesGuids[key] = value));
        words[destWordId].sensesGuids = newSensesGuids;

        // Cleanup the srcWord.
        delete words[srcWordId].sensesGuids[mergeSenseId];
        if (!Object.keys(words[srcWordId].sensesGuids).length) {
          // If this was the word's last sense, move the audio...
          const moves = state.audio.moves;
          if (!Object.keys(moves).includes(destWordId)) {
            moves[destWordId] = [];
          }
          moves[destWordId].push(srcWordId);
          if (Object.keys(moves).includes(srcWordId)) {
            moves[destWordId].push(...moves[srcWordId]);
            delete moves[srcWordId];
          }
          // ...and delete the word from the tree
          delete words[srcWordId];
        }
      }
    },

    moveDuplicateAction: (state, action) => {
      const srcRef = action.payload.src;
      // Verify that the ref.order field is defined
      if (srcRef.order !== undefined) {
        const destWordId = action.payload.destWordId;
        const words = state.tree.words;

        const srcWordId = srcRef.wordId;
        let mergeSenseId = srcRef.mergeSenseId;

        // Get guid of sense being restored from the sidebar.
        const srcGuids = words[srcWordId].sensesGuids[mergeSenseId];
        const guid = srcGuids.splice(srcRef.order, 1)[0];

        // Check if dropping the sense into a new word.
        if (words[destWordId] === undefined) {
          words[destWordId] = newMergeTreeWord();
        }

        if (srcGuids.length === 0) {
          // If there are no guids left, this is a full move.
          if (srcWordId === destWordId) {
            return;
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
      }
    },

    orderDuplicateAction: (state, action) => {
      const ref = action.payload.src;

      const oldOrder = ref.order;
      const newOrder = action.payload.destOrder;

      // Ensure the reorder is valid.
      if (oldOrder !== undefined && oldOrder !== newOrder) {
        // Move the guid.
        const oldSensesGuids = state.tree.words[ref.wordId].sensesGuids;
        const guids = [...oldSensesGuids[ref.mergeSenseId]];
        const guid = guids.splice(oldOrder, 1)[0];
        guids.splice(newOrder, 0, guid);

        const sensesGuids = { ...oldSensesGuids };
        sensesGuids[ref.mergeSenseId] = guids;

        state.tree.words[ref.wordId].sensesGuids = sensesGuids;
      }
    },

    orderSenseAction: (state, action) => {
      const word = state.tree.words[action.payload.src.wordId];

      // Convert the Hash<string[]> to an array to expose the order.
      const sensePairs = Object.entries(word.sensesGuids);

      const mergeSenseId = action.payload.src.mergeSenseId;
      const oldOrder = sensePairs.findIndex((p) => p[0] === mergeSenseId);
      const newOrder = action.payload.destOrder;

      // Ensure the move is valid.
      if (oldOrder > -1 && newOrder !== undefined && oldOrder !== newOrder) {
        // Move the sense pair to its new place.
        const pair = sensePairs.splice(oldOrder, 1)[0];
        sensePairs.splice(newOrder, 0, pair);

        // Rebuild the Hash<string[]>.
        word.sensesGuids = {};
        for (const [key, value] of sensePairs) {
          word.sensesGuids[key] = value;
        }

        state.tree.words[action.payload.src.wordId] = word;
      }
    },

    setSidebarAction: (state, action) => {
      state.tree.sidebar = action.payload;
    },

    setDataAction: (state, action) => {
      if (action.payload.length === 0) {
        state = defaultState;
      } else {
        const words: Hash<Word> = {};
        const senses: Hash<MergeTreeSense> = {};
        const wordsTree: Hash<MergeTreeWord> = {};
        const counts: Hash<number> = {};
        action.payload.forEach((word: Word) => {
          words[word.id] = JSON.parse(JSON.stringify(word));
          word.senses.forEach((s, order) => {
            senses[s.guid] = convertSenseToMergeTreeSense(s, word.id, order);
          });
          wordsTree[word.id] = convertWordToMergeTreeWord(word);
          counts[word.id] = word.audio.length;
        });
        state.data = { ...defaultData, senses, words };
        state.tree = { ...defaultTree, words: wordsTree };
        state.audio = { ...defaultAudio, counts };
        state.mergeWords = [];
      }
    },

    setVernacularAction: (state, action) => {
      state.tree.words[action.payload.wordId].vern = action.payload.vern;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const {
  clearMergeWordsAction,
  clearTreeAction,
  combineSenseAction,
  deleteSenseAction,
  flagWordAction,
  getMergeWordsAction,
  moveDuplicateAction,
  moveSenseAction,
  orderDuplicateAction,
  orderSenseAction,
  setDataAction,
  setSidebarAction,
  setVernacularAction,
} = mergeDuplicatesSlice.actions;

export default mergeDuplicatesSlice.reducer;
