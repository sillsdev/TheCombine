import {
  PronunciationsActionTypes,
  PronunciationsAction,
} from "./PronunciationsActions";
import { deleteAudio, uploadAudio } from "../../backend/index";

export const pronunciationsReducer = (action: PronunciationsAction) => {
  switch (action.type) {
    case "DELETE_AUDIO":
      return deleteAudio(action.wordId, action.fileName);
    case "UPLOAD_AUDIO":
      return uploadAudio(action.wordId, action.audioFile);
    default:
  }
};
