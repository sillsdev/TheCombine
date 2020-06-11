import { Word, Sense, State } from "../../../types/word";
import {
  ReviewEntriesWord,
  SEP_CHAR,
  ReviewEntriesSense,
  OLD_SENSE,
  parseWord,
} from "./ReviewEntriesTypes";
import * as backend from "../../../backend";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../types";

export enum ReviewEntriesActionTypes {
  UpdateAllWords = "UPDATE_ALL_WORDS",
  UpdateWord = "UPDATE_WORD",
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

export type ReviewEntriesAction = ReviewUpdateWords | ReviewUpdateWord;

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

// Return the translation code for our error, or undefined if there is no error
function getError(sense: ReviewEntriesSense): string | undefined {
  if (sense.glosses.length === 0) return "reviewEntries.error.gloss";
  else if (sense.domains.length === 0) return "reviewEntries.error.domain";
  else return undefined;
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
  let cleanSenses: ReviewEntriesSense[] = [];
  let senseBuffer: ReviewEntriesSense | undefined;
  let error: string | undefined;

  for (let newSense of senses) {
    // Skip new senses which are deleted or empty
    if (newSense.deleted && !newSense.senseId.endsWith(OLD_SENSE)) continue;
    else if (newSense.glosses.length === 0 && newSense.domains.length === 0)
      continue;

    if (newSense.glosses.length === 0 || newSense.domains.length === 0) {
      // New sense is missing information, attempt to retrieve it
      senseBuffer = oldSenses.find(
        (oldSense) => oldSense.senseId === newSense.senseId
      );

      if (senseBuffer) {
        // Old sense existed, fill in the blanks in the new sense from the old sense, then check for an error
        senseBuffer = { ...senseBuffer, deleted: newSense.deleted };
        if (newSense.glosses.length !== 0)
          senseBuffer = { ...senseBuffer, glosses: newSense.glosses };
        if (newSense.domains.length !== 0)
          senseBuffer = { ...senseBuffer, domains: newSense.domains };

        error = getError(senseBuffer);
      } else {
        // No old data, get the error
        error = getError(newSense);
      }
      if (error) return error;
    } else {
      // New sense is acceptable
      senseBuffer = newSense;
    }

    if (senseBuffer) cleanSenses.push(senseBuffer);
  }

  return cleanSenses;
}

// Clean the vernacular field of a word:
// * If there's no vernacular field, add in the vernacular of old field
// * If neither the word nor oldWord has a vernacular, reject
function cleanWord(
  word: ReviewEntriesWord,
  oldWord: ReviewEntriesWord
): ReviewEntriesWord | string {
  let vernacular =
    word.vernacular.length !== 0 ? word.vernacular : oldWord.vernacular;
  if (vernacular.length !== 0) {
    let senses = cleanSenses(word.senses, oldWord.senses);
    if (typeof senses !== "string") return { ...word, vernacular, senses };
    else return senses;
  } else return "reviewEntries.error.vernacular";
}

// Converts the ReviewEntriesWord into a Word to send to the backend
export function updateFrontierWord(
  newData: ReviewEntriesWord,
  oldData: ReviewEntriesWord,
  language: string
) {
  return async (
    dispatch: ThunkDispatch<StoreState, any, ReviewEntriesAction>
  ) => {
    // Clean + check data; if there's something irrepairably bad, return the error
    let editSource: ReviewEntriesWord | string = cleanWord(newData, oldData);
    if (typeof editSource === "string") return Promise.reject(editSource);

    let editWord: Word;
    let editSense: Sense | undefined;
    let originalIndex: number;
    editWord = await backend.getWord(editSource.id);

    originalIndex = 0;
    editWord.vernacular = editSource.vernacular;
    editWord.senses = editSource.senses.map((newSense) => {
      // Get the next original gloss, if it exists
      if (originalIndex < editWord.senses.length) {
        editSense = editWord.senses[originalIndex];
        originalIndex++;
      } else editSense = undefined;

      if (!newSense.deleted) {
        // Create a new sense if a sense doesn't exist
        if (!editSense)
          editSense = ({
            glosses: [],
            accessibility: State.active,
          } as any) as Sense;

        // Take all glosses from what the user edited, then add all glosses from the original word which are not in the current language
        // * If there are no glosses, then keep whatever glosses were present before
        if (newSense.glosses.length > 0)
          return {
            ...editSense,
            glosses: [
              ...newSense.glosses.split(SEP_CHAR).map((gloss) => {
                return {
                  language: language,
                  def: gloss.trim(),
                };
              }),
              ...editSense.glosses.filter(
                (gloss) => gloss.language !== language
              ),
            ],
            semanticDomains: newSense.domains,
          };
        else
          return {
            ...editSense,
            semanticDomains: newSense.domains,
          };
      } else
        return ({
          ...editSense,
          accessibility: State.deleted,
        } as any) as Sense;
    });

    dispatch(
      updateWord(
        editWord.id,
        (await backend.updateWord(editWord)).id,
        editSource
      )
    );
  };
}
// Converts the ReviewEntriesWord into a Word to send to the backend
export function refreshWord(oldWordId: string, newWordId: string) {
  return async (
    dispatch: ThunkDispatch<StoreState, any, ReviewEntriesAction>,
    getState: () => StoreState
  ) => {
    const newWord = await backend.getWord(newWordId);
    let analysisLang = getState().currentProject.analysisWritingSystems[0];
    dispatch(
      updateWord(oldWordId, newWordId, parseWord(newWord, analysisLang))
    );
  };
}
