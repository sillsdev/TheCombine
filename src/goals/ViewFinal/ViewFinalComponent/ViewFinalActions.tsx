import { Word, Sense, State } from "../../../types/word";
import {
  ViewFinalWord,
  SEP_CHAR,
  ViewFinalSense,
  OLD_SENSE
} from "./ViewFinalComponent";
import * as backend from "../../../backend";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../types";

export enum ViewFinalActionTypes {
  UpdateAllWords,
  UpdateWord,
  ResetEdits
}

interface FinalUpdateWords {
  type: ViewFinalActionTypes.UpdateAllWords;
  payload: { words: ViewFinalWord[] };
}

interface FinalUpdateWord {
  type: ViewFinalActionTypes.UpdateWord;
  payload: { id: string; newId: string; newWord: ViewFinalWord };
}

interface FinalResetEdits {
  type: ViewFinalActionTypes.ResetEdits;
}

export type ViewFinalAction =
  | FinalUpdateWords
  | FinalUpdateWord
  | FinalResetEdits;

export function updateAllWords(words: ViewFinalWord[]): FinalUpdateWords {
  return {
    type: ViewFinalActionTypes.UpdateAllWords,
    payload: { words }
  };
}

function updateWord(
  id: string,
  newId: string,
  newWord: ViewFinalWord
): FinalUpdateWord {
  return {
    type: ViewFinalActionTypes.UpdateWord,
    payload: { id, newId, newWord }
  };
}

// Returns a cleaned array of senses ready to be saved:
// * If a sense has no gloss, its old gloss is retrieved and added (if possible)
// * If a sense has no domains, its old domains are retrieved and added (if possible)
// * If a sense is utterly blank and was just created (has no history), it is removed
// * If a new sense has a gloss but no domain, or a domain but no gloss, it is retained
// * If a new sense is also deleted, it is removed
function cleanSenses(
  senses: ViewFinalSense[],
  oldSenses: ViewFinalSense[]
): ViewFinalSense[] {
  let cleanSenses: ViewFinalSense[] = [];
  let senseBuffer: ViewFinalSense | undefined;

  for (let newSense of senses) {
    // Skip new senses which are deleted
    if (newSense.deleted && !newSense.senseId.endsWith(OLD_SENSE)) continue;

    // If a sense is missing information, attempt to retrieve it
    if (newSense.glosses.length === 0 || newSense.domains.length === 0) {
      senseBuffer = oldSenses.find(
        oldSense => oldSense.senseId === newSense.senseId
      );

      // If the old sense existed, then hybrid them (add in non-blank information from the new sense to the old)
      if (senseBuffer) {
        senseBuffer = { ...senseBuffer, deleted: newSense.deleted };
        if (newSense.glosses.length !== 0)
          senseBuffer = { ...senseBuffer, glosses: newSense.glosses };
        if (newSense.domains.length !== 0)
          senseBuffer = { ...senseBuffer, domains: newSense.domains };
      }
      // If at least one field is defined, save the sense
      else if (newSense.glosses.length !== 0 || newSense.domains.length !== 0)
        senseBuffer = newSense;
    } else senseBuffer = newSense;

    // If the data existed at all, put it in the database
    if (senseBuffer) cleanSenses.push(senseBuffer);
  }

  return cleanSenses;
}

// Clean the vernacular field of a word:
// * If there's no vernacular field, add in the vernacular of old field
// * If neither the word nor oldWord has a vernacular, return undefined to alert the caller of bad data
function cleanWord(
  word: ViewFinalWord,
  oldWord: ViewFinalWord
): ViewFinalWord | undefined {
  if (word.vernacular.length !== 0)
    return { ...word, senses: cleanSenses(word.senses, oldWord.senses) };
  else if (oldWord.vernacular.length !== 0)
    return {
      ...word,
      vernacular: oldWord.vernacular,
      senses: cleanSenses(word.senses, oldWord.senses)
    };
  else return undefined;
}

export function updateFrontierWord(
  newData: ViewFinalWord,
  oldData: ViewFinalWord,
  language: string
) {
  let editSource: ViewFinalWord | undefined = cleanWord(newData, oldData);

  // Converts the ViewFinalWord data into a Word to send to the backend. Expecting data to have been run through cleanSenses beforehand
  return async (dispatch: ThunkDispatch<StoreState, any, ViewFinalAction>) => {
    // Reject the change if there's no vernacular
    if (!editSource) return Promise.reject("No vernacular detected");

    let editWord: Word;
    let editSense: Sense | undefined;
    let originalIndex: number;
    editWord = await backend.getWord(editSource.id);

    originalIndex = 0;
    editWord.vernacular = editSource.vernacular;
    editWord.senses = editSource.senses.map(newSense => {
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
            accessibility: State.active
          } as any) as Sense;

        // Take all glosses from what the user edited, then add all glosses from the original word which are not in the current language
        return {
          ...editSense,
          glosses: [
            ...newSense.glosses.split(SEP_CHAR).map(gloss => {
              return {
                language: language,
                def: gloss.trim()
              };
            }),
            ...editSense.glosses.filter(gloss => gloss.language !== language)
          ],
          semanticDomains: newSense.domains
        };
      } else
        return ({
          ...editSense,
          accessibility: State.deleted
        } as any) as Sense;
    });

    debugger;
    dispatch(
      updateWord(
        editWord.id,
        (await backend.updateWord(editWord)).id,
        editSource
      )
    );
  };
}
