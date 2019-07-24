import { Word, Sense, State } from "../../../types/word";
import { ViewFinalWord, SEP_CHAR } from "./ViewFinalComponent";
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

export function updateFrontierWord(
  editSource: ViewFinalWord,
  language: string
) {
  return async (dispatch: ThunkDispatch<StoreState, any, ViewFinalAction>) => {
    let editWord: Word;
    let editSense: Sense | undefined;
    let originalIndex: number;
    editWord = await backend.getWord(editSource.id);

    originalIndex = 0;
    editWord.vernacular = editSource.vernacular;
    editWord.senses = editSource.senses.map(newSense => {
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
