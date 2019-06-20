import {
  MergeTreeAction,
  ADD_PARENT,
  ADD_SENSE,
  ADD_DUPLICATE,
  REMOVE_DUPLICATE,
  CLEAR_MERGES
} from "./actions";
import { ParentWord } from "./component";
import { State, Word } from "../../../types/word";
import * as backend from "../../../backend";

export const defaultState: MergeTreeState = {
  parentWords: []
};

export interface MergeTreeState {
  parentWords: ParentWord[];
}

//ID assigned to parents as senses to help differentiate between them.
function generateID(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

export const mergeDupStepReducer = (
  state: MergeTreeState = defaultState, //createStore() calls each reducer with undefined state
  action: MergeTreeAction
): MergeTreeState => {
  let parentWords: ParentWord[];
  switch (action.type) {
    case ADD_PARENT:
      parentWords = state.parentWords;
      var word = action.payload.word;
      parentWords.push({
        id: generateID(),
        senses: [{ id: generateID(), dups: [word] }]
      });
      return {
        ...state,
        parentWords
      };
    case ADD_SENSE:
      parentWords = state.parentWords;
      var { word: merge, parent } = action.payload;
      if (parent) {
        parentWords = parentWords.map(item => {
          if (item.id === parent) {
            item.senses.push({
              id: generateID(),
              dups: [merge]
            });
          }
          return item;
        });
      }
      return {
        ...state,
        parentWords
      };
    case ADD_DUPLICATE:
      var { word: merge, parent } = action.payload;
      parentWords = state.parentWords;
      parentWords = parentWords.map(item => {
        item.senses = item.senses.map(item => {
          if (item.id === parent) {
            item.dups.push(merge);
          }
          return item;
        });
        return item;
      });
      return { ...state, parentWords };
    case REMOVE_DUPLICATE:
      var { word: merge, parent: root } = action.payload;
      parentWords = state.parentWords;

      parentWords = parentWords.map(parent => {
        parent.senses = parent.senses.map(sense => {
          if (sense.id === root) {
            sense.dups = sense.dups.filter(word => word !== merge);
          }
          return sense;
        });
        parent.senses = parent.senses.filter(sense => sense.dups.length > 0);
        return parent;
      });
      parentWords = parentWords.filter(parent => parent.senses.length > 0);

      return { ...state, parentWords };
    case CLEAR_MERGES:
        var senses: Word[] = [];
            if (sense.dups.length > 1) {
              senses.push({
                ...sense.dups[0],
                id: await backend.mergeWords(sense.dups, State.duplicate)
              });
              // Should never be 0
              senses.push(sense.dups[0]);
        if (senses.length > 0) {
          backend.mergeWords(senses, State.sense);
      return {
        ...state,
        parentWords: []
      };
    default:
      return state;
  }
};
