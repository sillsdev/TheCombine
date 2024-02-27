import { Action, PayloadAction } from "@reduxjs/toolkit";

import { StoreStateDispatch } from "Redux/rootReduxTypes";
import { Pronunciation, Sense, Word } from "api/models";
import * as backend from "backend";
import {
  addEntryEditToGoal,
  asyncUpdateGoal,
} from "components/GoalTimeline/Redux/GoalActions";
import { uploadFileFromPronunciation } from "components/Pronunciations/utilities";
import {
  deleteWordAction,
  resetReviewEntriesAction,
  setAllWordsAction,
  setSortByAction,
  updateWordAction,
} from "goals/ReviewEntries/Redux/ReviewEntriesReducer";
import {
  ColumnId,
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesTypes";
import {
  FileWithSpeakerId,
  newNote,
  newSense,
  updateSpeakerInAudio,
} from "types/word";

// Action Creation Functions

export function deleteWord(wordId: string): Action {
  return deleteWordAction(wordId);
}

export function resetReviewEntries(): Action {
  return resetReviewEntriesAction();
}

export function setAllWords(words: Word[]): PayloadAction {
  return setAllWordsAction(words);
}

export function setSortBy(columnId?: ColumnId): PayloadAction {
  return setSortByAction(columnId);
}

interface WordUpdate {
  oldId: string;
  updatedWord: Word;
}

export function updateWord(update: WordUpdate): PayloadAction {
  return updateWordAction(update);
}

// Dispatch Functions

/** Updates a word and the current goal. */
function asyncUpdateWord(oldId: string, updatedWord: Word) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(addEntryEditToGoal({ newId: updatedWord.id, oldId }));
    await dispatch(asyncUpdateGoal());
    dispatch(updateWord({ oldId, updatedWord }));
  };
}

/** Return the translation code for our error, or undefined if there is no error */
export function getSenseError(
  sense: ReviewEntriesSense,
  checkGlosses = true,
  checkDomains = false
): string | undefined {
  if (checkGlosses && sense.glosses.length === 0) {
    return "reviewEntries.error.gloss";
  }
  if (checkDomains && sense.domains.length === 0) {
    return "reviewEntries.error.domain";
  }
  return undefined;
}

/** Returns a cleaned array of senses ready to be saved (none with .deleted=true):
 * - If a sense is marked as deleted or is utterly blank, it is removed
 * - If a sense lacks gloss, return error
 * - If the user attempts to delete all senses, return old senses with deleted senses removed */
function cleanSenses(
  senses: ReviewEntriesSense[],
  oldSenses: ReviewEntriesSense[]
): ReviewEntriesSense[] | string {
  const cleanSenses: ReviewEntriesSense[] = [];
  let error: string | undefined;

  for (const newSense of senses) {
    // Remove empty definitions, empty glosses, and duplicate domains.
    newSense.definitions = newSense.definitions.filter((d) => d.text.length);
    newSense.glosses = newSense.glosses.filter((g) => g.def.length);
    const domainIds = [...new Set(newSense.domains.map((dom) => dom.id))];
    domainIds.sort();
    newSense.domains = domainIds.map(
      (id) => newSense.domains.find((dom) => dom.id === id)!
    );

    // Skip senses which are deleted or empty.
    if (
      newSense.deleted ||
      (newSense.definitions.length === 0 &&
        newSense.glosses.length === 0 &&
        newSense.domains.length === 0)
    ) {
      continue;
    }

    error = getSenseError(newSense);
    if (error) {
      return error;
    }

    cleanSenses.push(newSense);
  }

  if (cleanSenses.length) {
    return cleanSenses;
  }
  return oldSenses.filter((s) => !s.deleted);
}

/** Clean the vernacular field of a word:
 * - If all senses are deleted, reject
 * - If there's no vernacular field, add in the vernacular of old field
 * - If neither the word nor oldWord has a vernacular, reject */
function cleanWord(
  word: ReviewEntriesWord,
  oldWord: ReviewEntriesWord
): ReviewEntriesWord | string {
  if (!word.senses.find((s) => !s.deleted)) {
    return "reviewEntries.error.senses";
  }
  const vernacular = word.vernacular.length
    ? word.vernacular
    : oldWord.vernacular;
  if (!vernacular.length) {
    return "reviewEntries.error.vernacular";
  }
  const senses = cleanSenses(word.senses, oldWord.senses);
  return typeof senses === "string" ? senses : { ...word, vernacular, senses };
}

/** Converts the ReviewEntriesWord into a Word to send to the backend */
export function updateFrontierWord(
  newData: ReviewEntriesWord,
  oldData?: ReviewEntriesWord
) {
  return async (dispatch: StoreStateDispatch) => {
    oldData ??= new ReviewEntriesWord();

    // Clean + check data; if there's something wrong, return the error.
    const editSource = cleanWord(newData, oldData);
    if (typeof editSource === "string") {
      return Promise.reject(editSource);
    }
    const oldId = editSource.id;

    // Get the original word, for updating.
    const editWord = await backend.getWord(oldId);

    // Update the data.
    editWord.vernacular = editSource.vernacular;
    editWord.senses = editSource.senses.map((s) =>
      getSenseFromEditSense(s, editWord.senses)
    );
    editWord.note = newNote(editSource.noteText, editWord.note?.language);
    editWord.flag = { ...editSource.flag };

    // Apply any speakerId changes, but save adding/deleting audio for later.
    editWord.audio = oldData.audio.map(
      (o) => newData.audio.find((n) => n.fileName === o.fileName) ?? o
    );
    const delAudio = oldData.audio.filter(
      (o) => !newData.audio.find((n) => n.fileName === o.fileName)
    );
    const addAudio = [...(newData.audioNew ?? [])];

    // Update the word in the backend, and retrieve the id.
    let newId = (await backend.updateWord(editWord)).id;

    // Add/delete audio.
    for (const audio of addAudio) {
      newId = await uploadFileFromPronunciation(newId, audio);
    }
    for (const audio of delAudio) {
      newId = await backend.deleteAudio(newId, audio.fileName);
    }

    // Update the word in the state.
    await dispatch(asyncUpdateWord(oldId, await backend.getWord(newId)));
  };
}

/** Creates a Sense from a cleaned ReviewEntriesSense and array of old senses. */
export function getSenseFromEditSense(
  editSense: ReviewEntriesSense,
  oldSenses: Sense[]
): Sense {
  // If we match an old sense, copy it over.
  const oldSense = oldSenses.find((s) => s.guid === editSense.guid);
  const sense = oldSense ?? newSense();

  // Use the cleaned definitions, glosses, and domains.
  sense.definitions = [...editSense.definitions];
  sense.glosses = [...editSense.glosses];
  sense.semanticDomains = [...editSense.domains];

  return sense;
}

/** Performs specified backend Word-updating function, then makes state ReviewEntriesWord-updating dispatch */
function asyncRefreshWord(
  oldWordId: string,
  wordUpdater: (wordId: string) => Promise<string>
) {
  return async (dispatch: StoreStateDispatch): Promise<void> => {
    const newWordId = await wordUpdater(oldWordId);
    const word = await backend.getWord(newWordId);
    await dispatch(asyncUpdateWord(oldWordId, word));
  };
}

export function deleteAudio(
  wordId: string,
  fileName: string
): (dispatch: StoreStateDispatch) => Promise<void> {
  return asyncRefreshWord(wordId, (wordId: string) =>
    backend.deleteAudio(wordId, fileName)
  );
}

export function replaceAudio(
  wordId: string,
  pro: Pronunciation
): (dispatch: StoreStateDispatch) => Promise<void> {
  return asyncRefreshWord(wordId, async (oldId: string) => {
    const word = await backend.getWord(oldId);
    const audio = updateSpeakerInAudio(word.audio, pro);
    return audio ? (await backend.updateWord({ ...word, audio })).id : oldId;
  });
}

export function uploadAudio(
  wordId: string,
  file: FileWithSpeakerId
): (dispatch: StoreStateDispatch) => Promise<void> {
  return asyncRefreshWord(wordId, (wordId: string) =>
    backend.uploadAudio(wordId, file)
  );
}
