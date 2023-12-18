import { createSlice } from "@reduxjs/toolkit";
import { v4 } from "uuid";

import {
  GramCatGroup,
  MergeSourceWord,
  MergeWords,
  Status,
  Word,
} from "api/models";
import {
  convertSenseToMergeTreeSense,
  convertWordToMergeTreeWord,
  defaultSidebar,
  defaultTree,
  MergeData,
  MergeTreeSense,
  MergeTreeWord,
  newMergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { newMergeWords } from "goals/MergeDuplicates/MergeDupsTypes";
import { MergeTreeState } from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { StoreActionTypes } from "rootActions";
import { Hash } from "types/hash";
import { compareFlags } from "utilities/wordUtilities";

const defaultData = { words: {}, senses: {} };
export const defaultState: MergeTreeState = {
  data: defaultData,
  tree: defaultTree,
  mergeWords: [],
};

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
      const words = state.tree.words;

      const sensesGuids = words[srcWordId].sensesGuids;
      if (srcRef.order !== undefined) {
        sensesGuids[srcRef.mergeSenseId].splice(srcRef.order, 1);
        if (!sensesGuids[srcRef.mergeSenseId].length) {
          delete sensesGuids[srcRef.mergeSenseId];
        }
      } else {
        delete sensesGuids[srcRef.mergeSenseId];
      }
      if (!Object.keys(words[srcWordId].sensesGuids).length) {
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
        action.payload.forEach((word: Word) => {
          words[word.id] = JSON.parse(JSON.stringify(word));
          word.senses.forEach((s, order) => {
            senses[s.guid] = convertSenseToMergeTreeSense(s, word.id, order);
          });
          wordsTree[word.id] = convertWordToMergeTreeWord(word);
        });
        state.tree.words = wordsTree;
        state.data = { senses, words };
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
            ...sense,
            srcWordId: wordId,
            order: senses[wordId].length,
            accessibility: nonDeletedSenses.includes(sense.guid)
              ? Status.Separate
              : Status.Deleted,
            protected: sense.accessibility === Status.Protected,
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
        (s) => ![Status.Active, Status.Protected].includes(s.accessibility)
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
    (sList) => {
      sList.forEach((sense) => {
        if ([Status.Active, Status.Protected].includes(sense.accessibility)) {
          parent.senses.push({
            guid: sense.guid,
            definitions: sense.definitions,
            glosses: sense.glosses,
            semanticDomains: sense.semanticDomains,
            accessibility: sense.accessibility,
            grammaticalInfo: sense.grammaticalInfo,
          });
        }
      });
      const getAudio = !sList.find((s) => s.accessibility === Status.Separate);
      return { srcWordId: sList[0].srcWordId, getAudio };
    }
  );

  return newMergeWords(parent, children);
}

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
    // Put the duplicate's definitions in the main sense.
    const sep = ";";
    dupSense.definitions.forEach((def) => {
      if (def.text.length) {
        const defIndex = mainSense.definitions.findIndex(
          (d) => d.language === def.language
        );
        if (defIndex === -1) {
          mainSense.definitions.push({ ...def });
        } else {
          const oldText = mainSense.definitions[defIndex].text;
          if (!oldText.split(sep).includes(def.text)) {
            mainSense.definitions[defIndex].text =
              `${oldText}${sep}${def.text}`;
          }
        }
      }
    });
    // Use the duplicate's part of speech if not specified in the main sense.
    if (mainSense.grammaticalInfo.catGroup === GramCatGroup.Unspecified) {
      mainSense.grammaticalInfo = { ...dupSense.grammaticalInfo };
    }
    // Put the duplicate's domains in the main sense.
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
