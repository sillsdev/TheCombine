import { Action, PayloadAction } from "@reduxjs/toolkit";

import {
  resetAction,
  setPlayingAction,
  setRecordingAction,
} from "components/Pronunciations/Redux/PronunciationsReducer";

// Action Creation Functions

export function playing(fileName: string): PayloadAction {
  return setPlayingAction(fileName);
}

export function recording(wordId: string): PayloadAction {
  return setRecordingAction(wordId);
}

export function resetPronunciations(): Action {
  return resetAction();
}
