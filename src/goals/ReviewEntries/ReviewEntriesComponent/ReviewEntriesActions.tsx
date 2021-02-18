import * as backend from "backend";
import { getProjectId } from "backend/localStorage";
import {
  parseWord,
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
  id: string;
  newId: string;
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
  id: string,
  newId: string,
  newWord: ReviewEntriesWord
): ReviewUpdateWord {
  return {
    type: ReviewEntriesActionTypes.UpdateWord,
    id,
    newId,
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

// Returns a cleaned array of senses ready to be saved:
// * If a sense has no glosses, its old glosses are retrieved and added (if possible)
// * If a sense has no domains, its old domains are retrieved and added (if possible)
// * If a sense cannot have its data recovered, reject it
// * If a new sense is utterly blank and was just created, it is removed
// * If a new sense is also deleted, it is removed
// * If a new sense has a gloss but no domain, or a domain but no gloss, reject it
// * If the user attempts to delete all senses, return old senses
function cleanSenses(
  senses: ReviewEntriesSense[],
  oldSenses: ReviewEntriesSense[]
): ReviewEntriesSense[] | string {
  const cleanSenses: ReviewEntriesSense[] = [];
  let error: string | undefined;

  for (const newSense of senses) {
    // Skip new senses which are deleted or empty.
    if (
      (newSense.deleted &&
        !newSense.senseId.endsWith(ReviewEntriesSense.OLD_SENSE)) ||
      (newSense.glosses.length === 0 && newSense.domains.length === 0)
    ) {
      continue;
    }

    // If new sense is missing some information, attempt to retrieve it.
    if (newSense.glosses.length === 0 || newSense.domains.length === 0) {
      const oldSense = oldSenses.find((s) => s.senseId === newSense.senseId);
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

  return cleanSenses;
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

    // Update the vernacular.
    editWord.vernacular = editSource.vernacular;

    // Update the senses.
    const newSenses = [];
    for (let i = 0; i < editSource.senses.length; i++) {
      const displaySense = editSource.senses[i];

      // If the sense was deleted, nothing else matters.
      if (displaySense.deleted) {
        continue;
      }

      // If we align with an original sense, copy it over.
      const editSense: Sense =
        i < editWord.senses.length
          ? { ...editWord.senses[i] }
          : ({
              glosses: [],
              accessibility: State.Active,
            } as any);

      // Use the edited semantic domains.
      editSense.semanticDomains = [...displaySense.domains];

      // If there are edited glosses, replace the previous glosses with them.
      if (displaySense.glosses.length) {
        const newGlosses = [...displaySense.glosses];
        // If a language was specified, add all glosses of other langauges from the original.
        if (language) {
          newGlosses.push(
            ...editSense.glosses.filter((g) => g.language !== language)
          );
        }
        editSense.glosses = newGlosses;
      }

      newSenses.push(editSense);
    }
    editWord.senses = newSenses;

    // Update the note.
    editWord.note = new Note(editSource.noteText, editWord.note?.language);

    const newId = (await backend.updateWord(editWord)).id;
    dispatch(updateWord(editWord.id, newId, editSource));
  };
}

// Performs an action then converts the ReviewEntriesWord into a Word to send to the backend
function refreshWord(
  oldWordId: string,
  action: (wordId: string) => Promise<string>
) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const newWordId = await action(oldWordId);
    const newWord = await backend.getWord(newWordId);

    const analysisLang = getState().currentProject.analysisWritingSystems[0]
      ? getState().currentProject.analysisWritingSystems[0]
      : { name: "English", bcp47: "en", font: "" };

    dispatch(
      updateWord(oldWordId, newWordId, parseWord(newWord, analysisLang.bcp47))
    );
  };
}

export function deleteAudio(wordId: string, fileName: string) {
  let deleteAction = (wordId: string) => {
    return backend.deleteAudio(wordId, fileName);
  };
  return refreshWord(wordId, deleteAction);
}

export function uploadAudio(wordId: string, audioFile: File) {
  let uploadAction = (wordId: string) => {
    return backend.uploadAudio(wordId, audioFile);
  };
  return refreshWord(wordId, uploadAction);
}
