import {
  Definition,
  MergeSourceWord,
  MergeUndoIds,
  MergeWords,
  SemanticDomain,
  State,
  Word,
} from "api/models";
import * as backend from "backend";
import { asyncUpdateGoal } from "components/GoalTimeline/Redux/GoalActions";
import {
  defaultSidebar,
  Hash,
  MergeTreeReference,
  MergeTreeSense,
  Sidebar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { MergeDups } from "goals/MergeDupGoal/MergeDups";
import {
  MergesCompleted,
  MergeStepData,
  newMergeWords,
} from "goals/MergeDupGoal/MergeDupsTypes";
import {
  ClearTreeMergeAction,
  CombineSenseMergeAction,
  DeleteSenseMergeAction,
  MergeTreeActionTypes,
  MergeTreeState,
  MoveDuplicateMergeAction,
  MoveSenseMergeAction,
  OrderDuplicateMergeAction,
  OrderSenseMergeAction,
  SetDataMergeAction,
  SetSidebarMergeAction,
  SetVernacularMergeAction,
} from "goals/MergeDupGoal/Redux/MergeDupReduxTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { maxNumSteps } from "types/goalUtilities";
import { GoalType } from "types/goals";

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
                ? State.Separate
                : State.Deleted,
            });
          }
        }
      }
    }

    // Set sense and duplicate senses.
    Object.values(word.sensesGuids).forEach((guids) => {
      // Set the first sense to be merged as State.Active.
      const senseData = data.senses[guids[0]];
      const mainSense = senses[senseData.srcWordId][senseData.order];
      mainSense.accessibility = State.Active;

      // Merge the rest as duplicates.
      const dups = guids.slice(1).map((guid) => data.senses[guid]);
      dups.forEach((dup) => {
        const dupSense = senses[dup.srcWordId][dup.order];
        dupSense.accessibility = State.Duplicate;
        // Put the duplicate's definitions in the main sense.
        dupSense.definitions.forEach((def) =>
          mergeDefinitionIntoSense(mainSense, def)
        );
        // Put the duplicate's domains in the main sense.
        dupSense.semanticDomains.forEach((dom) =>
          mergeDomainIntoSense(mainSense, dom)
        );
      });
    });

    // Clean order of senses in each src word to reflect backend order.
    Object.values(senses).forEach((wordSenses) => {
      wordSenses = wordSenses.sort((a, b) => a.order - b.order);
      senses[wordSenses[0].srcWordId] = wordSenses;
    });

    // Don't return empty merges: when the only child is the parent word
    // and has the same number of senses as parent (all with State.Active).
    if (Object.values(senses).length === 1) {
      const onlyChild = Object.values(senses)[0];
      if (
        onlyChild[0].srcWordId === wordId &&
        onlyChild.length === data.words[wordId].senses.length &&
        !onlyChild.find((s) => s.accessibility !== State.Active)
      ) {
        return undefined;
      }
    }

    // Construct parent and children.
    const parent: Word = { ...data.words[wordId], senses: [] };
    if (!parent.vernacular) {
      parent.vernacular = word.vern;
    }
    const children: MergeSourceWord[] = Object.values(senses).map((sList) => {
      sList.forEach((sense) => {
        if (sense.accessibility === State.Active) {
          parent.senses.push({
            guid: sense.guid,
            definitions: sense.definitions,
            glosses: sense.glosses,
            semanticDomains: sense.semanticDomains,
            accessibility: sense.accessibility,
          });
        }
      });
      const getAudio = !sList.find((s) => s.accessibility === State.Separate);
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
    const words = Object.keys(mergeTree.tree.words);
    words.forEach((id) => {
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
      const goal = getState().goalsState.currentGoal;
      if (goal) {
        await dispatch(addCompletedMergeToGoal(goal, completedMerge));
      }
    }
  };
}

function addCompletedMergeToGoal(
  goal: MergeDups,
  completedMerge: MergeUndoIds
) {
  return async (dispatch: StoreStateDispatch) => {
    if (goal.goalType === GoalType.MergeDups) {
      const changes = (goal.changes ?? {}) as MergesCompleted;
      if (!changes.merges) {
        changes.merges = [];
      }
      changes.merges.push(completedMerge);
      goal.changes = changes;
      await dispatch(asyncUpdateGoal(goal));
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

/** Modifies the mutable input goal. */
export async function loadMergeDupsData(goal: MergeDups): Promise<void> {
  const newGroups = await backend.getDuplicates(5, maxNumSteps(goal.goalType));

  // Add data to goal.
  goal.data = { plannedWords: newGroups };
  goal.numSteps = newGroups.length;

  // Reset goal steps.
  goal.currentStep = 0;
  goal.steps = [];
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
/** Modifies the mutable input sense. */
export function mergeDomainIntoSense(
  sense: MergeTreeSense,
  dom: SemanticDomain
): void {
  if (!sense.semanticDomains.find((d) => d.id === dom.id)) {
    sense.semanticDomains.push({ ...dom });
  }
}
