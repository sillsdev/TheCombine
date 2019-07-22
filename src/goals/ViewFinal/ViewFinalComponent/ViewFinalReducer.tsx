import React from "react";

import { Word, Gloss, SemanticDomain, Sense } from "../../../types/word";
import tableIcons from "./icons";
import * as backend from "../../../backend";
import { ViewFinalWord } from "./ViewFinalComponent";
import { ViewFinalAction, ViewFinalActionTypes } from "./ViewFinalActions";

export interface ViewFinalState {
  words: ViewFinalWord[];
  frontier: Word[];
  edits: string[];
  language: string;
}

//   // Adds in glosses from glossBuffer; this both updates existing glosses and adds new ones
//   updateAddGlosses(glosses: Gloss[], glossBuffer: string[]): Gloss[] {
//   let glosses = action.payload.glosses;
//   let glossIndex: number = 0;
//   let superIndex: number = 0;

//   // Overwrite/add glosses
//   // debugger;
//   while (glossIndex < action.payload.glossBuffer.length) {
//     // Locate an entry
//     while (
//       glosses[superIndex] &&
//       glosses[superIndex].language !== state.language
//     )
//       superIndex++;

//     // Add the new entry
//     glosses[superIndex] = {
//       language: state.language,
//       def: action.payload.glossBuffer[glossIndex]
//     };
//     superIndex++;
//     glossIndex++;
//   }
//   // Remove dead glosses; superIndex is the index of the last valid gloss, so one beyond it
//   return glosses.slice(0, superIndex);
//   }

// Removes the specified domain from the word with the specified ID
// function deleteDomain(delDomain: SemanticDomain, id: string, senseIndex: number) {
//   }

const defaultState: ViewFinalState = {
  words: [],
  frontier: [],
  edits: [],
  language: "en"
};

export const viewFinalReducer = (
  state: ViewFinalState = defaultState, //createStore() calls each reducer with undefined state
  action: ViewFinalAction
): ViewFinalState => {
  let words: ViewFinalWord[];
  switch (action.type) {
    // Update the vernacular of the specified word
    case ViewFinalActionTypes.UpdateVernacularAction:
      words = state.words.map(value => {
        if (value.id === action.payload.id)
          return { ...value, vernacular: action.payload.newVernacular };
        else return value;
      });
      break;

    // Updates the specified sense with a new gloss
    case ViewFinalActionTypes.UpdateGlossAction:
      words = state.words.map(value => {
        if (value.id === action.payload.id)
          return {
            ...value,
            senses: [
              ...value.senses.slice(0, action.payload.editIndex),
              {
                ...value.senses[action.payload.editIndex],
                glosses: action.payload.newGlosses
              },
              ...value.senses.slice(
                action.payload.editIndex + 1,
                value.senses.length
              )
            ]
          };
        else return value;
      });
      break;

    // Adds the specified domain to the specified word + sense
    case ViewFinalActionTypes.AddDomainAction:
      words = state.words.map(word => {
        if (word.id === action.payload.id)
          return {
            ...word,
            senses: word.senses.map((sense, index) => {
              if (index === action.payload.senseIndex) {
                return {
                  ...sense,
                  domains: [...sense.domains, action.payload.newDomain]
                };
              } else return sense;
            })
          };
        else return word;
      });
      break;

    // Removes the domain from the specified word + sense
    case ViewFinalActionTypes.DeleteDomainAction:
      words = state.words.map(word => {
        if (word.id === action.payload.id)
          return {
            ...word,
            senses: word.senses.map((sense, index) => {
              if (index === action.payload.senseIndex)
                return {
                  ...sense,
                  domains: sense.domains.filter(
                    domain => domain !== action.payload.delDomain
                  )
                };
              else return sense;
            })
          };
        else return word;
      });
      break;

    // Adds an empty sense
    case ViewFinalActionTypes.AddSenseAction:
      words = state.words.map(value => {
        if (value.id === action.payload.id)
          return {
            ...value,
            senses: [
              ...value.senses,
              { deleted: false, glosses: "", domains: [] }
            ]
          };
        else return value;
      });
      break;

    // Removes the sense from the specified word
    case ViewFinalActionTypes.DeleteSenseAction:
      words = state.words.map(value => {
        if (value.id === action.payload.id)
          return {
            ...value,
            senses: value.senses.filter(
              (sense, index) => index !== action.payload.deleteIndex
            )
          };
        else return value;
      });
      break;

    // Update the local words and, if provided, frontier words
    case ViewFinalActionTypes.UpdateAllWords:
      if (action.payload.frontier)
        return {
          ...state,
          words: action.payload.words,
          frontier: action.payload.frontier
        };
      else
        return {
          ...state,
          words: action.payload.words
        };

    default:
      return state;
  }

  // Return new set of words + add edit
  return {
    ...state,
    words,
    edits: [...state.edits, action.payload.id]
  };
};
