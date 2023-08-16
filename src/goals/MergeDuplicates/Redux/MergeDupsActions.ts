import {
  Definition,
  Flag,
  GramCatGroup,
  MergeSourceWord,
  MergeWords,
  Status,
  Word,
} from "api/models";
import * as backend from "backend";
import {
  addCompletedMergeToGoal,
  asyncUpdateGoal,
} from "components/GoalTimeline/Redux/GoalActions";
import {
  defaultSidebar,
  MergeTreeReference,
  MergeTreeSense,
  Sidebar,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import {
  MergeDups,
  MergeStepData,
  newMergeWords,
} from "goals/MergeDuplicates/MergeDupsTypes";
import {
  ClearTreeMergeAction,
  CombineSenseMergeAction,
  DeleteSenseMergeAction,
  FlagWord,
  MergeTreeActionTypes,
  MergeTreeState,
  MoveDuplicateMergeAction,
  MoveSenseMergeAction,
  OrderDuplicateMergeAction,
  OrderSenseMergeAction,
  SetDataMergeAction,
  SetSidebarMergeAction,
  SetVernacularMergeAction,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { GoalType } from "types/goals";
import { Hash } from "types/hash";
import { maxNumSteps } from "utilities/goalUtilities";
import { compareFlags } from "utilities/wordUtilities";

// Action Creators

export function clearTree(): ClearTreeMergeAction {
  return { type: MergeTreeActionTypes.CLEAR_TREE };
}

export function combineSense(
  src: MergeTreeReference,
  dest: MergeTreeReference
): CombineSenseMergeAction {
  return { type: MergeTreeActionTypes.COMBINE_SENSE, payload: { src, dest } };
}

export function deleteSense(src: MergeTreeReference): DeleteSenseMergeAction {
  return { type: MergeTreeActionTypes.DELETE_SENSE, payload: { src } };
}

export function flagWord(wordId: string, flag: Flag): FlagWord {
  return { type: MergeTreeActionTypes.FLAG_WORD, payload: { wordId, flag } };
}

export function moveSense(
  ref: MergeTreeReference,
  destWordId: string,
  destOrder: number
): MoveDuplicateMergeAction | MoveSenseMergeAction {
  if (ref.order === undefined) {
    return {
      type: MergeTreeActionTypes.MOVE_SENSE,
      payload: { ...ref, destWordId, destOrder },
    };
  }
  // If ref.order is defined, the sense is being moved out of the sidebar.
  return {
    type: MergeTreeActionTypes.MOVE_DUPLICATE,
    payload: { ref, destWordId, destOrder },
  };
}

export function orderSense(
  ref: MergeTreeReference,
  order: number
): OrderDuplicateMergeAction | OrderSenseMergeAction {
  if (ref.order === undefined) {
    return {
      type: MergeTreeActionTypes.ORDER_SENSE,
      payload: { ...ref, order },
    };
  }
  // If ref.order is defined, the sense is being ordered within the sidebar.
  return {
    type: MergeTreeActionTypes.ORDER_DUPLICATE,
    payload: { ref, order },
  };
}

export function setSidebar(sidebar?: Sidebar): SetSidebarMergeAction {
  return {
    type: MergeTreeActionTypes.SET_SIDEBAR,
    payload: sidebar ?? defaultSidebar,
  };
}

export function setWordData(words: Word[]): SetDataMergeAction {
  return { type: MergeTreeActionTypes.SET_DATA, payload: words };
}

export function setVern(
  wordId: string,
  vern: string
): SetVernacularMergeAction {
  return {
    type: MergeTreeActionTypes.SET_VERNACULAR,
    payload: { wordId, vern },
  };
}

// Dispatch Functions

// Given a wordId, constructs from the state the corresponding MergeWords.
// Returns the MergeWords, or undefined if the parent and child are identical.
function getMergeWords(
  wordId: string,
  mergeTree: MergeTreeState
): MergeWords | undefined {
  // Find and build MergeSourceWord[].
  const word = mergeTree.tree.words[wordId];
  if (word) {
    const data = mergeTree.data;

    // List of all non-deleted senses.
    const nonDeleted = Object.values(mergeTree.tree.words).flatMap((w) =>
      Object.values(w.sensesGuids).flatMap((s) => s)
    );

    // Create list of all senses and add merge type tags slit by src word.
    const senses: Hash<MergeTreeSense[]> = {};

    // Build senses array.
    for (const senseGuids of Object.values(word.sensesGuids)) {
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
              accessibility: nonDeleted.includes(sense.guid)
                ? Status.Separate
                : Status.Deleted,
              protected: sense.accessibility === Status.Protected,
            });
          }
        }
      }
    }

    // Set sense and duplicate senses.
    Object.values(word.sensesGuids).forEach((guids) => {
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

    // Don't return empty merges: when the only child is the parent word
    // and has the same number of senses as parent (all Active/Protected)
    // and has the same flag.
    if (Object.values(senses).length === 1) {
      const onlyChild = Object.values(senses)[0];
      if (
        onlyChild[0].srcWordId === wordId &&
        onlyChild.length === data.words[wordId].senses.length &&
        !onlyChild.find(
          (s) => ![Status.Active, Status.Protected].includes(s.accessibility)
        ) &&
        compareFlags(word.flag, data.words[wordId].flag) === 0
      ) {
        return undefined;
      }
    }

    // Construct parent and children.
    const parent: Word = { ...data.words[wordId], senses: [], flag: word.flag };
    if (!parent.vernacular) {
      parent.vernacular = word.vern;
    }
    const children: MergeSourceWord[] = Object.values(senses).map((sList) => {
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
    });

    return newMergeWords(parent, children);
  }
}

export function mergeAll() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const mergeTree = getState().mergeDuplicateGoal;

    // Add to blacklist.
    await backend.blacklistAdd(Object.keys(mergeTree.data.words));

    // Handle words with all senses deleted.
    const possibleWords = Object.values(mergeTree.data.words);
    const nonDeletedSenses = Object.values(mergeTree.tree.words).flatMap((w) =>
      Object.values(w.sensesGuids).flatMap((s) => s)
    );
    const deletedWords = possibleWords.filter(
      (w) =>
        !w.senses.map((s) => s.guid).find((g) => nonDeletedSenses.includes(g))
    );
    const mergeWordsArray = deletedWords.map((w) =>
      newMergeWords(w, [{ srcWordId: w.id, getAudio: false }], true)
    );

    // Merge words.
    const wordIds = Object.keys(mergeTree.tree.words);
    wordIds.forEach((id) => {
      const wordsToMerge = getMergeWords(id, mergeTree);
      if (wordsToMerge) {
        mergeWordsArray.push(wordsToMerge);
      }
    });
    if (mergeWordsArray.length) {
      const parentIds = await backend.mergeWords(mergeWordsArray);
      const childIds = [
        ...new Set(
          mergeWordsArray.flatMap((m) => m.children).map((s) => s.srcWordId)
        ),
      ];
      const completedMerge = { childIds, parentIds };
      if (getState().goalsState.currentGoal) {
        //dispatch(addCompletedMergeToGoal(completedMerge));
        dispatch(addCompletedMergeToGoal(completedMerge));
        await dispatch(asyncUpdateGoal());
      }
    }
  };
}

// Used in MergeDups cases of GoalActions functions

export function dispatchMergeStepData(goal: MergeDups) {
  return (dispatch: StoreStateDispatch) => {
    const stepData = goal.steps[goal.currentStep] as MergeStepData;
    if (stepData) {
      const stepWords = stepData.words ?? [];
      dispatch(setWordData(stepWords));
    }
  };
}

export async function fetchMergeDupsData(
  goalType: GoalType
): Promise<Word[][]> {
  return await backend.getDuplicates(5, maxNumSteps(goalType));
}

/** Modifies the mutable input sense list. */
export function combineIntoFirstSense(senses: MergeTreeSense[]): void {
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
    dupSense.definitions.forEach((def) =>
      mergeDefinitionIntoSense(mainSense, def)
    );
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

/** Modifies the mutable input sense. */
export function mergeDefinitionIntoSense(
  sense: MergeTreeSense,
  def: Definition,
  sep = ";"
): void {
  if (!def.text.length) {
    return;
  }
  const defIndex = sense.definitions.findIndex(
    (d) => d.language === def.language
  );
  if (defIndex === -1) {
    sense.definitions.push({ ...def });
  } else {
    const oldText = sense.definitions[defIndex].text;
    if (!oldText.split(sep).includes(def.text)) {
      sense.definitions[defIndex].text = `${oldText}${sep}${def.text}`;
    }
  }
}
