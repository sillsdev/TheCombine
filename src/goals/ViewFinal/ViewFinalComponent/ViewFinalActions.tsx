import { SemanticDomain, Word } from "../../../types/word";
import { ViewFinalWord } from "./ViewFinalComponent";

export enum ViewFinalActionTypes {
  SetWordAction,
  UpdateVernacularAction,
  UpdateGlossAction,
  AddDomainAction,
  DeleteDomainAction,
  AddSenseAction,
  DeleteSenseAction,
  UpdateWords,
  UpdateWord,
  ResetEdits
}

interface FinalUpdateVernacular {
  type: ViewFinalActionTypes.UpdateVernacularAction;
  payload: { id: string; newVernacular: string };
}

interface FinalUpdateGlosses {
  type: ViewFinalActionTypes.UpdateGlossAction;
  payload: { id: string; editId: string; newGlosses: string };
}

interface FinalAddDomain {
  type: ViewFinalActionTypes.AddDomainAction;
  payload: { id: string; senseId: string; newDomain: SemanticDomain };
}

interface FinalDeleteDomain {
  type: ViewFinalActionTypes.DeleteDomainAction;
  payload: { id: string; senseId: string; delDomain: SemanticDomain };
}

interface FinalAddSense {
  type: ViewFinalActionTypes.AddSenseAction;
  payload: { id: string };
}

interface FinalDeleteSense {
  type: ViewFinalActionTypes.DeleteSenseAction;
  payload: { id: string; deleteId: string };
}

interface FinalUpdateWords {
  type: ViewFinalActionTypes.UpdateWords;
  payload: { words: ViewFinalWord[] };
}

interface FinalUpdateWord {
  type: ViewFinalActionTypes.UpdateWord;
  payload: { id: string; newId: string; newWord: ViewFinalWord | undefined };
}

interface FinalResetEdits {
  type: ViewFinalActionTypes.ResetEdits;
}

export type ViewFinalAction =
  | FinalUpdateVernacular
  | FinalUpdateGlosses
  | FinalAddDomain
  | FinalDeleteDomain
  | FinalAddSense
  | FinalDeleteSense
  | FinalUpdateWords
  | FinalUpdateWord
  | FinalResetEdits;

export function updateVernacular(
  id: string,
  newVernacular: string
): FinalUpdateVernacular {
  return {
    type: ViewFinalActionTypes.UpdateVernacularAction,
    payload: { id, newVernacular }
  };
}

export function updateGlosses(
  id: string,
  editId: string,
  newGlosses: string
): FinalUpdateGlosses {
  return {
    type: ViewFinalActionTypes.UpdateGlossAction,
    payload: { id, editId, newGlosses }
  };
}

export function addDomain(
  id: string,
  senseId: string,
  newDomain: SemanticDomain
): FinalAddDomain {
  return {
    type: ViewFinalActionTypes.AddDomainAction,
    payload: { id, senseId, newDomain }
  };
}

export function deleteDomain(
  id: string,
  senseId: string,
  delDomain: SemanticDomain
): FinalDeleteDomain {
  return {
    type: ViewFinalActionTypes.DeleteDomainAction,
    payload: { id, senseId, delDomain }
  };
}

export function addSense(id: string): FinalAddSense {
  return {
    type: ViewFinalActionTypes.AddSenseAction,
    payload: { id }
  };
}

export function deleteSense(id: string, deleteId: string): FinalDeleteSense {
  return {
    type: ViewFinalActionTypes.DeleteSenseAction,
    payload: { id, deleteId }
  };
}

export function updateWords(words: ViewFinalWord[]): FinalUpdateWords {
  return {
    type: ViewFinalActionTypes.UpdateWords,
    payload: { words }
  };
}

export function updateWord(
  id: string,
  newId: string,
  newWord?: ViewFinalWord
): FinalUpdateWord {
  return {
    type: ViewFinalActionTypes.UpdateWord,
    payload: { id, newId, newWord }
  };
}

export function resetEdits(): FinalResetEdits {
  return {
    type: ViewFinalActionTypes.ResetEdits
  };
}
