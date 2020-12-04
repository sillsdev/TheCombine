import { ThunkDispatch } from "redux-thunk";

import { StoreState } from "../../types";

export enum PronunciationsStatus {
  Default = "DEFAULT",
  Playing = "PLAYING",
  Recording = "RECORDING",
}

export interface PronunciationsAction {
  type: PronunciationsStatus;
  payload?: string;
}

export function audioPlaying(fileName: string) {
  return (dispatch: ThunkDispatch<StoreState, any, PronunciationsAction>) => {
    dispatch(playing(fileName));
  };
}

export function audioRecording(wordId: string) {
  return (dispatch: ThunkDispatch<StoreState, any, PronunciationsAction>) => {
    dispatch(recording(wordId));
  };
}

export function playing(payload: string): PronunciationsAction {
  return {
    type: PronunciationsStatus.Playing,
    payload,
  };
}

export function recording(payload: string): PronunciationsAction {
  return {
    type: PronunciationsStatus.Recording,
    payload,
  };
}

export function reset(): PronunciationsAction {
  return { type: PronunciationsStatus.Default };
}
