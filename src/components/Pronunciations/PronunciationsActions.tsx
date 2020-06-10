export enum PronunciationsActionTypes {
  DeleteAudio = "DELETE_AUDIO",
  UploadAudio = "UPLOAD_AUDIO",
}

interface PronunciationsDeleteAudio {
  type: PronunciationsActionTypes.DeleteAudio;
  wordId: string;
  fileName: string;
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
  fileName: string
): PronunciationsDeleteAudio {
  return {
    type: PronunciationsActionTypes.DeleteAudio,
    wordId,
    fileName,
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
