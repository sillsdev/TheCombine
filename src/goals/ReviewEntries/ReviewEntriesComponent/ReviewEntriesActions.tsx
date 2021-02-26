import * as backend from "backend";
import { getProjectId } from "backend/localStorage";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { Note, Sense, State } from "types/word";

export enum ReviewEntriesActionTypes {
  SetAnalysisLanguage = "SET_ANALYSIS_LANGUAGE",
  UpdateAllWords = "UPDATE_ALL_WORDS",
  UpdateWord = "UPDATE_WORD",
  ClearReviewEntriesState = "CLEAR_REVIEW_ENTRIES_STATE",
}

interface ReviewSetAnalysisLanguage {
  type: ReviewEntriesActionTypes.SetAnalysisLanguage;
  analysisLanguage: string;
}

interface ReviewUpdateWords {
  type: ReviewEntriesActionTypes.UpdateAllWords;
  words: ReviewEntriesWord[];
}

interface ReviewUpdateWord {
  type: ReviewEntriesActionTypes.UpdateWord;
  oldId: string;
  newWord: ReviewEntriesWord;
}

interface ReviewClearReviewEntriesState {
  type: ReviewEntriesActionTypes.ClearReviewEntriesState;
}

export type ReviewEntriesAction =
  | ReviewSetAnalysisLanguage
  | ReviewUpdateWords
  | ReviewUpdateWord
  | ReviewClearReviewEntriesState;

export function setAnalysisLanguage(
  analysisLanguage: string
): ReviewSetAnalysisLanguage {
  return {
    type: ReviewEntriesActionTypes.SetAnalysisLanguage,
    analysisLanguage,
  };
}

export function updateAllWords(words: ReviewEntriesWord[]): ReviewUpdateWords {
  return {
    type: ReviewEntriesActionTypes.UpdateAllWords,
    words,
  };
}

function updateWord(
  oldId: string,
  newWord: ReviewEntriesWord
): ReviewUpdateWord {
  return {
    type: ReviewEntriesActionTypes.UpdateWord,
    oldId,
    newWord,
  };
}

export function clearReviewEntriesState(): ReviewClearReviewEntriesState {
  return {
    type: ReviewEntriesActionTypes.ClearReviewEntriesState,
  };
}

// Return the translation code for our error, or undefined if there is no error
function getError(sense: ReviewEntriesSense): string | undefined {
  if (sense.deleted) return undefined;
  if (sense.glosses.length === 0) return "reviewEntries.error.gloss";
  else if (sense.domains.length === 0) return "reviewEntries.error.domain";
  else return undefined;
}

export function setAnalysisLang() {
  return async (dispatch: StoreStateDispatch) => {
    const projectId = getProjectId();
    const project = await backend.getProject(projectId);
    // Needs to be changed when multiple analysis writing systems is allowed
    dispatch(setAnalysisLanguage(project.analysisWritingSystems[0].bcp47));
  };
}

// Returns a cleaned array of senses ready to be saved (none with .deleted=true):
// * If a sense is marked as deleted or is utterly blank, it is removed
// * If a sense has no glosses, its old glosses are recovered (if possible)
// * If a sense has no domains, its old domains are recovered (if possible)
// * If after attempted recovery, a new sense still has no gloss or no domain, return error
// * If the user attempts to delete all senses, return old senses with deleted senses removed
function cleanSenses(
  senses: ReviewEntriesSense[],
  oldSenses: ReviewEntriesSense[]
): ReviewEntriesSense[] | string {
  const cleanSenses: ReviewEntriesSense[] = [];
  let error: string | undefined;

  for (const newSense of senses) {
    // Skip new senses which are deleted or empty.
    if (
      newSense.deleted ||
      (newSense.glosses.length === 0 && newSense.domains.length === 0)
    ) {
      continue;
    }

    // If new sense is missing some information, attempt to retrieve it.
    if (newSense.glosses.length === 0 || newSense.domains.length === 0) {
      const oldSense = oldSenses.find((s) => s.guid === newSense.guid);
      if (oldSense) {
        if (!newSense.glosses.length) {
          newSense.glosses = [...oldSense.glosses];
        }
        if (!newSense.domains.length) {
          newSense.domains = [...oldSense.domains];
        }
      }
    }

    error = getError(newSense);
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
  const activeSenseIndex = word.senses.findIndex((s) => !s.deleted);
  if (activeSenseIndex === -1) {
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
  oldData: ReviewEntriesWord,
  language?: string
) {
  return async (dispatch: StoreStateDispatch) => {
    // Clean + check data; if there's something irrepairably bad, return the error
    const editSource = cleanWord(newData, oldData);
    if (typeof editSource === "string") {
      return Promise.reject(editSource);
    }

    // Get the original word, for updating.
    const editWord = await backend.getWord(editSource.id);

    // Update the data.
    editWord.vernacular = editSource.vernacular;
    editWord.senses = editSource.senses.map((s) =>
      getSenseFromEditSense(s, editWord.senses, language)
    );
    editWord.note = new Note(editSource.noteText, editWord.note?.language);

    // Update the word in the backend, and retrieve the id.
    editSource.id = (await backend.updateWord(editWord)).id;

    // Update the review entries word in the state.
    dispatch(updateWord(editWord.id, editSource));
  };
}

// Creates a new Sense from a cleaned ReviewEntriesSense and array of old senses.
export function getSenseFromEditSense(
  editSense: ReviewEntriesSense,
  oldSenses: Sense[],
  language?: string
) {
  // If we match an old sense, copy it over.
  const oldSense = oldSenses.find((s) => s.guid === editSense.guid);
  const newSense: Sense = oldSense
    ? { ...oldSense }
    : { ...new Sense(), accessibility: State.Active };

  // Use the edited semantic domains.
  newSense.semanticDomains = [...editSense.domains];

  // If there are edited glosses, replace the previous glosses with them.
  if (editSense.glosses.length) {
    const newGlosses = [...editSense.glosses];
    // If a language was specified, add all glosses of other langauges from the original.
    if (language) {
      newGlosses.push(
        ...newSense.glosses.filter((g) => g.language !== language)
      );
    }
    newSense.glosses = newGlosses;
  }
  return newSense;
}

// Performs specified backend Word-updating function, then makes state ReviewEntriesWord-updating dispatch
function refreshWord(
  oldWordId: string,
  wordUpdater: (wordId: string) => Promise<string>
) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const newWordId = await wordUpdater(oldWordId);
    const newWord = await backend.getWord(newWordId);

    const analysisLang =
      getState().currentProject.analysisWritingSystems[0]?.bcp47 ?? "en";
    dispatch(
      updateWord(oldWordId, new ReviewEntriesWord(newWord, analysisLang))
    );
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
