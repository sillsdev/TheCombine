import {
  PronunciationsAction,
  PronunciationsStatus,
} from "components/Pronunciations/Redux/PronunciationsReduxTypes";

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
