import { createSlice } from "@reduxjs/toolkit";
import { v4 } from "uuid";

import { GramCatGroup, Status, type Word } from "api/models";
import {
  type MergeTreeSense,
  type MergeTreeWord,
  convertSenseToMergeTreeSense,
  convertWordToMergeTreeWord,
  defaultData,
  defaultSidebar,
  newMergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { newMergeWords } from "goals/MergeDuplicates/MergeDupsTypes";
import {
  type MergeDeleted,
  defaultState,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { StoreActionTypes } from "rootActions";
import { type Hash } from "types/hash";
import { compareFlags } from "utilities/wordUtilities";

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

        state.audio.moves = getAudioMoves(state.data.words, state.tree.words);
      }
    },
    deleteSenseAction: (state, action) => {
      const srcRef = action.payload;
      const srcWordId = srcRef.wordId;
      const words = state.tree.words;

      const sensesGuids = words[srcWordId].sensesGuids;
      const sGuids = sensesGuids[srcRef.mergeSenseId];
      if (srcRef.order !== undefined) {
        state.deleted.senseGuids.push(sGuids[srcRef.order]);
        sGuids.splice(srcRef.order, 1);
        if (!sGuids.length) {
          delete sensesGuids[srcRef.mergeSenseId];
        }
      } else {
        state.deleted.senseGuids.push(...sGuids);
        delete sensesGuids[srcRef.mergeSenseId];
      }
      if (!Object.keys(words[srcWordId].sensesGuids).length) {
        delete words[srcWordId];
      }

      // Update the array of deleted word.
      state.deleted.words = Object.values(state.data.words).filter((w) =>
        w.senses.every((s) => state.deleted.senseGuids.includes(s.guid))
      );

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

      state.audio.moves = getAudioMoves(state.data.words, state.tree.words);
    },
    flagWordAction: (state, action) => {
      state.tree.words[action.payload.wordId].flag = action.payload.flag;
    },
    getMergeWordsAction: (state) => {
      // First handle words with all senses deleted.
      state.mergeWords = state.deleted.words.map((w) =>
        newMergeWords(w, [{ srcWordId: w.id, getAudio: false }], true)
      );

      // Then build the rest of the mergeWords.

      // Gather all the senses of non-deleted words.
      // (The accessibility of senses will be updated as the mergeWords are built.)
      const wordTreeSenses = gatherSenses(
        Object.values(state.data.words),
        state.deleted
      );
      const allSenses = Object.values(wordTreeSenses).flatMap((a) => a);

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

        // Get this merge's children ids.
        const redundantIds = mergeSenses.flatMap((senses) =>
          senses.map((s) => s.srcWordId)
        );
        const childrenIds = [...new Set(redundantIds)];

        // Check if nothing to merge.
        const wordToUpdate = state.data.words[wordId];
        if (
          childrenIds.length === 1 &&
          isEmptyMerge(wordToUpdate, mergeWord, wordTreeSenses[childrenIds[0]])
        ) {
          continue;
        }

        // Create merge words.
        const getAudioIds = state.audio.moves[wordId] ?? [];
        const children = childrenIds.map((srcWordId) => ({
          srcWordId,
          getAudio: srcWordId === wordId || getAudioIds.includes(srcWordId),
        }));
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
          delete words[srcWordId];
        }

        state.audio.moves = getAudioMoves(state.data.words, state.tree.words);
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

        state.audio.moves = getAudioMoves(state.data.words, state.tree.words);
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

        state.audio.moves = getAudioMoves(state.data.words, state.tree.words);
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
      if (oldOrder !== -1 && newOrder !== undefined && oldOrder !== newOrder) {
        // Move the sense pair to its new place.
        const pair = sensePairs.splice(oldOrder, 1)[0];
        sensePairs.splice(newOrder, 0, pair);

        // Rebuild the Hash<string[]>.
        word.sensesGuids = {};
        for (const [key, value] of sensePairs) {
          word.sensesGuids[key] = value;
        }

        state.tree.words[action.payload.src.wordId] = word;

        state.audio.moves = getAudioMoves(state.data.words, state.tree.words);
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
        const audioCounts: Hash<number> = {};
        action.payload.forEach((word: Word) => {
          words[word.id] = JSON.parse(JSON.stringify(word));
          word.senses.forEach((s, order) => {
            senses[s.guid] = convertSenseToMergeTreeSense(s, word.id, order);
          });
          wordsTree[word.id] = convertWordToMergeTreeWord(word);
          audioCounts[word.id] = word.audio.length;
        });
        state.tree.words = wordsTree;
        state.audio.counts = audioCounts;
        state.data = { ...defaultData, senses, words };
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

// Helper Functions

/** Determine which words need their audio to move. */
function getAudioMoves(
  dataWords: Hash<Word>,
  treeWords: Hash<MergeTreeWord>
): Hash<string[]> {
  const moveAudio: Hash<string[]> = {};
  Object.entries(dataWords).forEach(([fromId, word]) => {
    if (!Object.keys(treeWords).includes(fromId)) {
      getTreeWordIdsWithWordSenses(treeWords, word).forEach((toId) => {
        if (!(toId in moveAudio)) {
          moveAudio[toId] = [];
        }
        moveAudio[toId].push(fromId);
      });
    }
  });
  return moveAudio;
}

/** Get ids from the given treeWords for all that have senses from the given word. */
function getTreeWordIdsWithWordSenses(
  treeWords: Hash<MergeTreeWord>,
  word: Word
): string[] {
  const tws = Object.entries(treeWords);
  // Find whether any have senses as primary senses.
  const words = tws.filter((val) =>
    doesTreeWordHaveWordSense(val[1], word, false)
  );
  if (words.length) {
    return words.map((val) => val[0]);
  }
  // Fall back to checking duplicate senses.
  return tws
    .filter((val) => doesTreeWordHaveWordSense(val[1], word, true))
    .map((val) => val[0]);
}

/** Check if any of the senses in the given treeWord is a sense of the given word. */
function doesTreeWordHaveWordSense(
  treeWord: MergeTreeWord,
  word: Word,
  allowDuplicate: boolean
): boolean {
  const senseGuids = word.senses.map((s) => s.guid);
  const treeSenses = Object.values(treeWord.sensesGuids);
  if (allowDuplicate) {
    return treeSenses.some((guids) =>
      senseGuids.some((g) => guids.includes(g))
    );
  }
  return treeSenses.some((guids) => senseGuids.includes(guids[0]));
}

/** Gather all senses for non-deleted words. Return dictionary:
 * - key: word id
 * - value: MergeTreeSense array with Status.Deleted/Status.Separate entries */
function gatherSenses(
  words: Word[],
  deleted: MergeDeleted
): Hash<MergeTreeSense[]> {
  const senses: Hash<MergeTreeSense[]> = {};

  // Gather all senses for non-deleted words.
  for (const word of words) {
    if (deleted.words.some((w) => w.id === word.id)) {
      continue;
    }

    // Add each sense as separate or deleted.
    senses[word.id] = word.senses.map((sense, index) => ({
      ...sense,
      accessibility: deleted.senseGuids.includes(sense.guid)
        ? Status.Deleted
        : Status.Separate,
      order: index,
      protected: sense.accessibility === Status.Protected,
      srcWordId: word.id,
    }));
  }

  return senses;
}

/** Determine if merge is empty:
 * - when the only child is the parent word
 * - the merge has the same number of senses as the parent
 * - all senses are Active/Protected
 * - the flag is unchanged */
function isEmptyMerge(
  word: Word,
  mergeWord: MergeTreeWord,
  childSenses: MergeTreeSense[]
): boolean {
  return (
    childSenses[0].srcWordId === word.id &&
    Object.keys(mergeWord.sensesGuids).length === word.senses.length &&
    childSenses.every((s) =>
      [Status.Active, Status.Protected].includes(s.accessibility)
    ) &&
    compareFlags(mergeWord.flag, word.flag) === 0
  );
}

/** Construct parent of a mergeWord */
function createMergeParent(
  word: Word,
  mergeWord: MergeTreeWord,
  allSenses: MergeTreeSense[]
): Word {
  // Construct parent.
  const senses = Object.values(mergeWord.sensesGuids)
    .map((guids) => guids[0])
    .map((g) => allSenses.find((s) => s.guid === g)!);
  return {
    ...word,
    flag: mergeWord.flag,
    senses,
    vernacular: word.vernacular.trim() || mergeWord.vern.trim(),
  };
}

/** Given an array of senses to combine:
 * - change the accessibility of the first one from Separate to Active/Protected,
 * - change the accessibility of the rest to Duplicate,
 * - merge select content from duplicates into main sense */
function combineIntoFirstSense(senses: MergeTreeSense[]): void {
  // Set the first sense to be merged as Active/Protected.
  // This was the top sense when the sidebar was opened.
  const mainSense = senses[0];
  mainSense.accessibility = mainSense.protected
    ? Status.Protected
    : Status.Active;

  // Merge the rest as duplicates.
  // These were senses dropped into another sense.
  senses.slice(1).forEach((dupSense) => {
    dupSense.accessibility = Status.Duplicate;
    // Merge the duplicate's definitions into the main sense.
    const sep = ";";
    dupSense.definitions.forEach((def) => {
      const newText = def.text.trim();
      if (newText) {
        // Check if definitions array already has entry with the same language.
        const oldDef = mainSense.definitions.find(
          (d) => d.language === def.language
        );
        if (!oldDef) {
          // If not, add this one to the array.
          mainSense.definitions.push({ ...def, text: newText });
        } else {
          // If so, check whether this one's text is already present.
          const oldText = oldDef.text.trim();
          if (!oldText) {
            oldDef.text = newText;
          } else if (
            !oldText
              .split(sep)
              .map((t) => t.trim())
              .includes(newText)
          ) {
            oldDef.text += `${sep} ${newText}`;
          }
        }
      }
    });

    // Use the duplicate's part of speech if not specified in the main sense.
    if (mainSense.grammaticalInfo.catGroup === GramCatGroup.Unspecified) {
      mainSense.grammaticalInfo = { ...dupSense.grammaticalInfo };
    }

    // Put the duplicate's domains in the main sense if the id is new.
    dupSense.semanticDomains.forEach((dom) => {
      if (!mainSense.semanticDomains.find((d) => d.id === dom.id)) {
        mainSense.semanticDomains.push({ ...dom });
      }
    });
  });
}

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
