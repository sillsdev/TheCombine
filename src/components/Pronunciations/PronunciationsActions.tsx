import { refreshWord } from "../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../types";
import * as backend from "../../backend";

export enum PronunciationsActionTypes {
  DeleteAudio = "DELETE_AUDIO",
  UploadAudio = "UPLOAD_AUDIO",
}

interface PronunciationsDeleteAudio {
  type: PronunciationsActionTypes.DeleteAudio;
  wordId: string;
  newWordId: string;
}

interface PronunciationsUploadAudio {
  type: PronunciationsActionTypes.UploadAudio;
  wordId: string;
  audioFile: File;
}

export type PronunciationsAction =
  | PronunciationsDeleteAudio
  | PronunciationsUploadAudio;

export function deleteAudio(
  wordId: string,
  newWordId: string
): PronunciationsDeleteAudio {
  return {
    type: PronunciationsActionTypes.DeleteAudio,
    wordId,
    newWordId,
  };
}

export function uploadAudio(
  wordId: string,
  audioFile: File
): PronunciationsUploadAudio {
  return {
    type: PronunciationsActionTypes.UploadAudio,
    wordId,
    audioFile,
  };
}

export function deleteAudioFromWord(wordId: string, fileName: string) {
  return async (
    dispatch: ThunkDispatch<StoreState, any, PronunciationsAction>,
    getState: () => StoreState
  ) => {
    const newWordId = await backend.deleteAudio(wordId, fileName);

    dispatch(deleteAudio(wordId, newWordId));
  };
}
