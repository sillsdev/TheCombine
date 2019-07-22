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
  UpdateAllWords
}

interface FinalUpdateVernacular {
  type: ViewFinalActionTypes.UpdateVernacularAction;
  payload: { id: string; newVernacular: string };
}

interface FinalUpdateGlosses {
  type: ViewFinalActionTypes.UpdateGlossAction;
  payload: { id: string; editIndex: number; newGlosses: string };
}

interface FinalAddDomain {
  type: ViewFinalActionTypes.AddDomainAction;
  payload: { id: string; senseIndex: number; newDomain: SemanticDomain };
}

interface FinalDeleteDomain {
  type: ViewFinalActionTypes.DeleteDomainAction;
  payload: { id: string; senseIndex: number; delDomain: SemanticDomain };
}

interface FinalAddSense {
  type: ViewFinalActionTypes.AddSenseAction;
  payload: { id: string };
}

interface FinalDeleteSense {
  type: ViewFinalActionTypes.DeleteSenseAction;
  payload: { id: string; deleteIndex: number };
}

interface FinalUpdateAllWords {
  type: ViewFinalActionTypes.UpdateAllWords;
  payload: { words: ViewFinalWord[]; frontier: Word[] | undefined };
}

export type ViewFinalAction =
  | FinalUpdateVernacular
  | FinalUpdateGlosses
  | FinalAddDomain
  | FinalDeleteDomain
  | FinalAddSense
  | FinalDeleteSense
  | FinalUpdateAllWords;

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
  editIndex: number,
  newGlosses: string
): FinalUpdateGlosses {
  return {
    type: ViewFinalActionTypes.UpdateGlossAction,
    payload: { id, editIndex, newGlosses }
  };
}

export function addDomain(
  id: string,
  senseIndex: number,
  newDomain: SemanticDomain
): FinalAddDomain {
  return {
    type: ViewFinalActionTypes.AddDomainAction,
    payload: { id, senseIndex, newDomain }
  };
}

export function deleteDomain(
  id: string,
  senseIndex: number,
  delDomain: SemanticDomain
): FinalDeleteDomain {
  return {
    type: ViewFinalActionTypes.DeleteDomainAction,
    payload: { id, senseIndex, delDomain }
  };
}

export function addSense(id: string): FinalAddSense {
  return {
    type: ViewFinalActionTypes.AddSenseAction,
    payload: { id }
  };
}

export function deleteSense(id: string, deleteIndex: number): FinalDeleteSense {
  return {
    type: ViewFinalActionTypes.DeleteSenseAction,
    payload: { id, deleteIndex }
  };
}

export function updateAllWords(
  words: ViewFinalWord[],
  frontier?: Word[]
): FinalUpdateAllWords {
  return {
    type: ViewFinalActionTypes.UpdateAllWords,
    payload: { words, frontier }
  };
}
