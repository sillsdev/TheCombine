import { ViewFinalWord, OLD_SENSE } from "./ViewFinalComponent";
import { ViewFinalAction, ViewFinalActionTypes } from "./ViewFinalActions";
import { uuid } from "../../../utilities";

export interface ViewFinalState {
  words: ViewFinalWord[];
  edits: string[];
  language: string;
}

const defaultState: ViewFinalState = {
  words: [],
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
            senses: value.senses.map(sense => {
              if (sense.senseId === action.payload.editId)
                return {
                  ...sense,
                  glosses: action.payload.newGlosses
                };
              else return sense;
            })
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
            senses: word.senses.map(sense => {
              if (
                sense.senseId === action.payload.senseId &&
                !sense.domains.find(
                  value => value.id === action.payload.newDomain.id
                )
              ) {
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
            senses: word.senses.map(sense => {
              if (sense.senseId === action.payload.senseId)
                return {
                  ...sense,
                  domains: sense.domains.filter(
                    domain => domain.id !== action.payload.delDomain.id
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
              {
                deleted: false,
                glosses: "",
                domains: [],
                senseId: uuid()
              }
            ]
          };
        else return value;
      });
      break;

    // Removes the sense from the specified word
    case ViewFinalActionTypes.DeleteSenseAction:
      // If the sense existed when the frontier was pulled, update it. Otherwise, delete it
      if (action.payload.deleteId.endsWith(OLD_SENSE))
        words = state.words.map(value => {
          if (value.id === action.payload.id)
            return {
              ...value,
              senses: value.senses.map(sense => {
                if (sense.senseId === action.payload.deleteId)
                  return { ...sense, deleted: true };
                else return sense;
              })
            };
          else return value;
        });
      else
        words = state.words.map(value => {
          if (value.id === action.payload.id)
            return {
              ...value,
              senses: value.senses.filter(
                sense => sense.senseId !== action.payload.deleteId
              )
            };
          else return value;
        });
      break;

    // Update the local words
    case ViewFinalActionTypes.UpdateWords:
      return {
        ...state,
        words: action.payload.words,
        edits: []
      };

    // Resets all word edits
    case ViewFinalActionTypes.ResetEdits:
      return {
        ...state,
        edits: []
      };

    // Update the id of a specified word
    case ViewFinalActionTypes.UpdateWord:
      return {
        ...state,
        words: state.words.map(word => {
          if (word.id === action.payload.id) {
            words = [action.payload.newWord ? action.payload.newWord : word];
            return {
              ...words[0],
              id: action.payload.id,
              senses: words[0].senses.map(sense => {
                return {
                  ...sense,
                  senseId: sense.senseId + OLD_SENSE
                };
              })
            };
          } else return word;
        })
      };

    // Update the id of a specified word
    case ViewFinalActionTypes.UpdateWord:
      return {
        ...state,
        words: state.words.map(word => {
          if (word.id === action.payload.id)
            return {
              ...word,
              id: action.payload.id,
              senses: word.senses.map(sense => {
                return {
                  ...sense,
                  senseId: sense.senseId + OLD_SENSE
                };
              })
            };
          else return word;
        })
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
