import { createSlice } from "@reduxjs/toolkit";
import { v4 } from "uuid";

import {
  GramCatGroup,
  type MergeSourceWord,
  type MergeWords,
  Status,
  type Word,
} from "api/models";
import {
  type MergeData,
  type MergeTreeSense,
  type MergeTreeWord,
  convertSenseToMergeTreeSense,
  convertWordToMergeTreeWord,
  defaultSidebar,
  defaultTree,
  newMergeTreeWord,
  MergeTreeReference,
  Sidebar,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { newMergeWords } from "goals/MergeDuplicates/MergeDupsTypes";
import { defaultState } from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
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
      const srcRef: MergeTreeReference = action.payload.src;
      const destRef: MergeTreeReference = action.payload.dest;

      // Ignore dropping a sense (or one of its sub-senses) into itself.
      if (srcRef.mergeSenseId !== destRef.mergeSenseId) {
        const words = state.tree.words;
        const srcWordId = srcRef.wordId;
        const srcGuids = words[srcWordId].sensesGuids[srcRef.mergeSenseId];
        const destGuids: string[] = [];
        if (srcRef.order === undefined || srcGuids.length === 1) {
          // A sense from a word dropped into another sense.
          destGuids.push(...srcGuids);
          delete words[srcWordId].sensesGuids[srcRef.mergeSenseId];
          if (!Object.keys(words[srcWordId].sensesGuids).length) {
            delete words[srcWordId];
          }
        } else {
          // A sense from the sidebar dropped into another sense.
          destGuids.push(srcGuids.splice(srcRef.order, 1)[0]);
          if (srcGuids.length < 2) {
            // If not multiple senses in the sidebar, reset the sidebar.
            state.tree.sidebar = defaultSidebar;
          }
        }

        words[destRef.wordId].sensesGuids[destRef.mergeSenseId].push(
          ...destGuids
        );
        state.tree.words = words;
      }
    },

    deleteSenseAction: (state, action) => {
      const srcRef: MergeTreeReference = action.payload;
      const srcWordId = srcRef.wordId;
      const words = state.tree.words;

      const sensesGuids = words[srcWordId].sensesGuids;
      const srcGuids = sensesGuids[srcRef.mergeSenseId];
      if (srcRef.order === undefined || srcGuids.length === 1) {
        // A sense deleted from a word.
        delete sensesGuids[srcRef.mergeSenseId];
        if (!Object.keys(sensesGuids).length) {
          delete words[srcWordId];
        }

        // If the deleted sense was open in the sidebar, reset the sidebar.
        const { mergeSenseId, wordId } = state.tree.sidebar;
        if (mergeSenseId === srcRef.mergeSenseId && wordId === srcRef.wordId) {
          state.tree.sidebar = defaultSidebar;
        }
      } else {
        // A sense deleted from the sidebar.
        srcGuids.splice(srcRef.order, 1);
        if (srcGuids.length < 2) {
          // If not multiple senses in the sidebar, reset the sidebar.
          state.tree.sidebar = defaultSidebar;
        }
      }
    },

    flagWordAction: (state, action) => {
      state.tree.words[action.payload.wordId].flag = action.payload.flag;
    },

    getMergeWordsAction: (state) => {
      // Handle words with all senses deleted.
      const possibleWords = Object.values(state.data.words);
      // List of all non-deleted senses.
      const nonDeletedSenses = Object.values(state.tree.words).flatMap((w) =>
        Object.values(w.sensesGuids).flatMap((s) => s)
      );
      const deletedWords = possibleWords.filter(
        (w) =>
          !w.senses.map((s) => s.guid).find((g) => nonDeletedSenses.includes(g))
      );
      state.mergeWords = deletedWords.map((w) =>
        newMergeWords(w, [{ srcWordId: w.id, getAudio: false }], true)
      );

      for (const wordId in state.tree.words) {
        const mergeWord = state.tree.words[wordId];
        const mergeSenses = buildSenses(
          mergeWord.sensesGuids,
          state.data,
          nonDeletedSenses
        );
        const mergeWords = createMergeWords(
          wordId,
          mergeWord,
          mergeSenses,
          state.data.words[wordId]
        );
        if (mergeWords) {
          state.mergeWords.push(mergeWords);
        }
      }
    },

    moveSenseAction: (state, action) => {
      const destWordId = action.payload.destWordId;
      const srcRef: MergeTreeReference = action.payload.src;
      const srcWordId = srcRef.wordId;
      // Verify that this is a valid movement of a word sense.
      if (srcRef.order === undefined && srcWordId !== destWordId) {
        const mergeSenseId = srcRef.mergeSenseId;

        const words = state.tree.words;

        // Check if dropping the sense into a new word.
        if (words[destWordId] === undefined) {
          if (Object.keys(words[srcWordId].sensesGuids).length === 1) {
            // Don't do anything if the sense was alone in its word.
            return;
          }
          words[destWordId] = newMergeTreeWord();
        }

        // Update the destWord.
        const guids = words[srcWordId].sensesGuids[mergeSenseId];
        const sensesPairs = Object.entries(words[destWordId].sensesGuids);
        sensesPairs.splice(action.payload.destOrder, 0, [mergeSenseId, guids]);
        words[destWordId].sensesGuids = Object.fromEntries(sensesPairs);

        // Cleanup the srcWord.
        delete words[srcWordId].sensesGuids[mergeSenseId];
        if (!Object.keys(words[srcWordId].sensesGuids).length) {
          delete words[srcWordId];
        }
      }
    },

    moveDuplicateAction: (state, action) => {
      const srcRef: MergeTreeReference = action.payload.src;
      const words = state.tree.words;
      const srcGuids = words[srcRef.wordId].sensesGuids[srcRef.mergeSenseId];
      // Verify that this is a valid movement of a sidebar sense.
      if (srcRef.order !== undefined && srcGuids.length > 1) {
        const destWordId = action.payload.destWordId;

        // Get guid of sense being restored from the sidebar.
        const guid = srcGuids.splice(srcRef.order, 1)[0];
        if (srcGuids.length < 2) {
          // If not multiple senses in the sidebar, reset the sidebar.
          state.tree.sidebar = defaultSidebar;
        }

        // Check if dropping the sense into a new word.
        if (words[destWordId] === undefined) {
          words[destWordId] = newMergeTreeWord();
        }

        // Update the destWord.
        const sensesPairs = Object.entries(words[destWordId].sensesGuids);
        sensesPairs.splice(action.payload.destOrder, 0, [v4(), [guid]]);
        words[destWordId].sensesGuids = Object.fromEntries(sensesPairs);
      }
    },

    orderDuplicateAction: (state, action) => {
      const ref: MergeTreeReference = action.payload.src;
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
      const ref: MergeTreeReference = action.payload.src;
      const word = state.tree.words[ref.wordId];

      // Convert the Hash<string[]> to an array to expose the order.
      const sensePairs = Object.entries(word.sensesGuids);

      const mergeSenseId = ref.mergeSenseId;
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

        state.tree.words[ref.wordId] = word;
      }
    },

    setSidebarAction: (state, action) => {
      const sidebar: Sidebar = action.payload;
      // Only open sidebar with multiple senses.
      state.tree.sidebar =
        sidebar.mergeSenses.length > 1 ? sidebar : defaultSidebar;
    },

    setDataAction: (state, action) => {
      if (action.payload.length === 0) {
        state = defaultState;
      } else {
        const words: Hash<Word> = {};
        const senses: Hash<MergeTreeSense> = {};
        const wordsTree: Hash<MergeTreeWord> = {};
        action.payload.forEach((word: Word) => {
          words[word.id] = JSON.parse(JSON.stringify(word));
          word.senses.forEach((s, order) => {
            senses[s.guid] = convertSenseToMergeTreeSense(s, word.id, order);
          });
          wordsTree[word.id] = convertWordToMergeTreeWord(word);
        });
        state.data = { senses, words };
        state.tree = { ...defaultTree, words: wordsTree };
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

/** Create hash of senses keyed by id of src word. */
function buildSenses(
  sensesGuids: Hash<string[]>,
  data: MergeData,
  nonDeletedSenses: string[]
): Hash<MergeTreeSense[]> {
  const senses: Hash<MergeTreeSense[]> = {};
  for (const senseGuids of Object.values(sensesGuids)) {
    for (const guid of senseGuids) {
      const senseData = data.senses[guid];
      const wordId = senseData.srcWordId;

      if (!senses[wordId]) {
        const dbWord = data.words[wordId];

        // Add each sense into senses as separate or deleted.
        senses[wordId] = [];
        for (const sense of dbWord.senses) {
          senses[wordId].push({
            order: senses[wordId].length,
            protected: sense.accessibility === Status.Protected,
            srcWordId: wordId,
            sense: {
              ...sense,
              accessibility: nonDeletedSenses.includes(sense.guid)
                ? Status.Separate
                : Status.Deleted,
            },
          });
        }
      }
    }
  }

  // Set sense and duplicate senses.
  Object.values(sensesGuids).forEach((guids) => {
    const sensesToCombine = guids
      .map((g) => data.senses[g])
      .map((s) => senses[s.srcWordId][s.order]);
    combineIntoFirstSense(sensesToCombine);
  });

  // Clean order of senses in each src word to reflect backend order.
  Object.values(senses).forEach((wordSenses) => {
    wordSenses = wordSenses.sort((a, b) => a.order - b.order);
    senses[wordSenses[0].srcWordId] = wordSenses;
  });

  return senses;
}

function createMergeWords(
  wordId: string,
  mergeWord: MergeTreeWord,
  mergeSenses: Hash<MergeTreeSense[]>,
  word: Word
): MergeWords | undefined {
  // Don't return empty merges: when the only child is the parent word
  // and has the same number of senses as parent (all Active/Protected)
  // and has the same flag.
  if (Object.values(mergeSenses).length === 1) {
    const onlyChild = Object.values(mergeSenses)[0];
    if (
      onlyChild[0].srcWordId === wordId &&
      onlyChild.length === word.senses.length &&
      !onlyChild.find(
        (ms) =>
          ![Status.Active, Status.Protected].includes(ms.sense.accessibility)
      ) &&
      compareFlags(mergeWord.flag, word.flag) === 0
    ) {
      return;
    }
  }

  // Construct parent and children.
  const parent: Word = {
    ...word,
    senses: [],
    flag: mergeWord.flag,
  };
  if (!parent.vernacular) {
    parent.vernacular = mergeWord.vern;
  }
  const children: MergeSourceWord[] = Object.values(mergeSenses).map(
    (msList) => {
      msList.forEach((mergeSense) => {
        if (
          [Status.Active, Status.Protected].includes(
            mergeSense.sense.accessibility
          )
        ) {
          parent.senses.push(mergeSense.sense);
        }
      });
      const getAudio = !msList.find(
        (ms) => ms.sense.accessibility === Status.Separate
      );
      return { srcWordId: msList[0].srcWordId, getAudio };
    }
  );

  return newMergeWords(parent, children);
}

/** Given an array of senses to combine:
 * - change the accessibility of the first one from Separate to Active/Protected,
 * - change the accessibility of the rest to Duplicate,
 * - merge select content from duplicates into main sense */
function combineIntoFirstSense(mergeSenses: MergeTreeSense[]): void {
  // Set the first sense to be merged as Active/Protected.
  // This was the top sense when the sidebar was opened.
  const mainSense = mergeSenses[0].sense;
  mainSense.accessibility = mergeSenses[0].protected
    ? Status.Protected
    : Status.Active;

  // Merge the rest as duplicates.
  // These were senses dropped into another sense.
  mergeSenses.slice(1).forEach((mergeDupSense) => {
    const dupSense = mergeDupSense.sense;
    dupSense.accessibility = Status.Duplicate;
    // Merge the duplicate's definitions into the main sense.
    const sep = "; ";
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
          } else if (!oldText.includes(newText)) {
            oldDef.text = `${oldText}${sep}${newText}`;
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
