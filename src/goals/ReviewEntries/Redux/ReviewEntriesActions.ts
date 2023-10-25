import { Sense } from "api/models";
import * as backend from "backend";
import {
  addEntryEditToGoal,
  asyncUpdateGoal,
} from "components/GoalTimeline/Redux/GoalActions";
import { uploadFileFromUrl } from "components/Pronunciations/utilities";
import {
  ReviewClearReviewEntriesState,
  ReviewEntriesActionTypes,
  ReviewSortBy,
  ReviewUpdateWord,
  ReviewUpdateWords,
} from "goals/ReviewEntries/Redux/ReviewEntriesReduxTypes";
import {
  ColumnId,
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesTypes";
import { StoreStateDispatch } from "types/Redux/actions";
import { newNote, newSense } from "types/word";

export function sortBy(columnId?: ColumnId): ReviewSortBy {
  return {
    type: ReviewEntriesActionTypes.SortBy,
    sortBy: columnId,
  };
}

export function updateAllWords(words: ReviewEntriesWord[]): ReviewUpdateWords {
  return {
    type: ReviewEntriesActionTypes.UpdateAllWords,
    words,
  };
}

function updateWord(oldId: string, updatedWord: ReviewEntriesWord) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(addEntryEditToGoal({ newId: updatedWord.id, oldId }));
    await dispatch(asyncUpdateGoal());
    const update: ReviewUpdateWord = {
      type: ReviewEntriesActionTypes.UpdateWord,
      oldId,
      updatedWord,
    };
    dispatch(update);
  };
}

export function clearReviewEntriesState(): ReviewClearReviewEntriesState {
  return { type: ReviewEntriesActionTypes.ClearReviewEntriesState };
}

// Return the translation code for our error, or undefined if there is no error
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

// Returns a cleaned array of senses ready to be saved (none with .deleted=true):
// * If a sense is marked as deleted or is utterly blank, it is removed
// * If a sense lacks gloss, return error
// * If the user attempts to delete all senses, return old senses with deleted senses removed
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

// Clean the vernacular field of a word:
// * If all senses are deleted, reject
// * If there's no vernacular field, add in the vernacular of old field
// * If neither the word nor oldWord has a vernacular, reject
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

// Converts the ReviewEntriesWord into a Word to send to the backend
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

    // Set aside audio changes for last.
    const delAudio = oldData.audio.filter(
      (o) => !newData.audio.find((n) => n === o)
    );
    const addAudio = [...(newData.audioNew ?? [])];
    editSource.audio = oldData.audio;
    delete editSource.audioNew;

    // Get the original word, for updating.
    const editWord = await backend.getWord(editSource.id);

    // Update the data.
    editWord.vernacular = editSource.vernacular;
    editWord.senses = editSource.senses.map((s) =>
      getSenseFromEditSense(s, editWord.senses)
    );
    editWord.note = newNote(editSource.noteText, editWord.note?.language);
    editWord.flag = { ...editSource.flag };

    // Update the word in the backend, and retrieve the id.
    editSource.id = (await backend.updateWord(editWord)).id;

    // Add/remove audio.
    for (const url of addAudio) {
      editSource.id = await uploadFileFromUrl(editSource.id, url);
    }
    for (const fileName of delAudio) {
      editSource.id = await backend.deleteAudio(editSource.id, fileName);
    }
    editSource.audio = (await backend.getWord(editSource.id)).audio;

    // Update the review entries word in the state.
    await dispatch(updateWord(editWord.id, editSource));
  };
}

// Creates a Sense from a cleaned ReviewEntriesSense and array of old senses.
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

// Performs specified backend Word-updating function, then makes state ReviewEntriesWord-updating dispatch
function refreshWord(
  oldWordId: string,
  wordUpdater: (wordId: string) => Promise<string>
) {
  return async (dispatch: StoreStateDispatch): Promise<void> => {
    const newWordId = await wordUpdater(oldWordId);
    const word = await backend.getWord(newWordId);
    await dispatch(updateWord(oldWordId, new ReviewEntriesWord(word)));
  };
}

export function deleteAudio(
  wordId: string,
  fileName: string
): (dispatch: StoreStateDispatch) => Promise<void> {
  return refreshWord(wordId, (wordId: string) =>
    backend.deleteAudio(wordId, fileName)
  );
}

export function uploadAudio(
  wordId: string,
  audioFile: File
): (dispatch: StoreStateDispatch) => Promise<void> {
  return refreshWord(wordId, (wordId: string) =>
    backend.uploadAudio(wordId, audioFile)
  );
}
