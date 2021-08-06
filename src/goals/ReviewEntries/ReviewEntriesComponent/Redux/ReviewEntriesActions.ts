import { Sense } from "api/models";
import * as backend from "backend";
import {
  ReviewClearReviewEntriesState,
  ReviewEntriesActionTypes,
  ReviewUpdateWord,
  ReviewUpdateWords,
} from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReduxTypes";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { newNote, newSense } from "types/word";

export function updateAllWords(words: ReviewEntriesWord[]): ReviewUpdateWords {
  return {
    type: ReviewEntriesActionTypes.UpdateAllWords,
    words,
  };
}

function updateWord(
  oldId: string,
  updatedWord: ReviewEntriesWord
): ReviewUpdateWord {
  return {
    type: ReviewEntriesActionTypes.UpdateWord,
    oldId,
    updatedWord,
  };
}

export function clearReviewEntriesState(): ReviewClearReviewEntriesState {
  return {
    type: ReviewEntriesActionTypes.ClearReviewEntriesState,
  };
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
  oldData: ReviewEntriesWord
) {
  return async (dispatch: StoreStateDispatch) => {
    // Clean + check data; if there's something wrong, return the error.
    const editSource = cleanWord(newData, oldData);
    if (typeof editSource === "string") {
      return Promise.reject(editSource);
    }

    // Get the original word, for updating.
    const editWord = await backend.getWord(editSource.id);

    // Update the data.
    editWord.vernacular = editSource.vernacular;
    editWord.senses = editSource.senses.map((s) =>
      getSenseFromEditSense(s, editWord.senses)
    );
    editWord.note = newNote(editSource.noteText, editWord.note?.language);

    // Update the word in the backend, and retrieve the id.
    editSource.id = (await backend.updateWord(editWord)).id;

    // Update the review entries word in the state.
    dispatch(updateWord(editWord.id, editSource));
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
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const newWordId = await wordUpdater(oldWordId);
    const word = await backend.getWord(newWordId);

    const analysisLang =
      getState().currentProjectState.project.analysisWritingSystems[0]?.bcp47 ??
      "en";
    dispatch(updateWord(oldWordId, new ReviewEntriesWord(word, analysisLang)));
  };
}

export function deleteAudio(wordId: string, fileName: string) {
  return refreshWord(wordId, (wordId: string) =>
    backend.deleteAudio(wordId, fileName)
  );
}

export function uploadAudio(wordId: string, audioFile: File) {
  return refreshWord(wordId, (wordId: string) =>
    backend.uploadAudio(wordId, audioFile)
  );
}
