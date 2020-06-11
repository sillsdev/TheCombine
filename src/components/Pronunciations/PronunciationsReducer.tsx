import {
  PronunciationsActionTypes,
  PronunciationsAction,
} from "./PronunciationsActions";
import { deleteAudio, uploadAudio } from "../../backend/index";

export const pronunciationsReducer = (action: PronunciationsAction) => {
  switch (action.type) {
    case "DELETE_AUDIO":
      // Update the specified word's IDs and data
      return {
        ...state,
        words: state.words.map((word) => {
          if (word.id === action.id) {
            return {
              ...action.newWord,
              id: action.newId,
              vernacular: action.newWord.vernacular,
              senses: action.newWord.senses.map((sense) => ({
                ...sense,
                senseId: sense.senseId + OLD_SENSE,
              })),
            };
          } else return word;
        }),
      };
    case "UPLOAD_AUDIO":
      return uploadAudio(action.wordId, action.audioFile);
    default:
  }
};
