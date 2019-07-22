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
  UpdateWordId
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

interface FinalUpdateWords {
  type: ViewFinalActionTypes.UpdateWords;
  payload: { words: ViewFinalWord[] };
}

interface FinalUpdateWordId {
  type: ViewFinalActionTypes.UpdateWordId;
  payload: { oldId: string; newId: string };
}

export type ViewFinalAction =
  | FinalUpdateVernacular
  | FinalUpdateGlosses
  | FinalAddDomain
  | FinalDeleteDomain
  | FinalAddSense
  | FinalDeleteSense
  | FinalUpdateWords
  | FinalUpdateWordId;

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

export function updateWords(words: ViewFinalWord[]): FinalUpdateWords {
  return {
    type: ViewFinalActionTypes.UpdateWords,
    payload: { words }
  };
}

export function updateWordId(oldId: string, newId: string): FinalUpdateWordId {
  return {
    type: ViewFinalActionTypes.UpdateWordId,
    payload: { oldId, newId }
  };
}
