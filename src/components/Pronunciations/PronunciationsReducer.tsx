import { StoreAction, StoreActions } from "rootActions";
import {
  PronunciationsAction,
  PronunciationsStatus,
} from "components/Pronunciations/PronunciationsActions";

export interface PronunciationsState {
  type: PronunciationsStatus;
  payload: string;
}

export const defaultState: PronunciationsState = {
  type: PronunciationsStatus.Default,
  payload: "",
};

export const pronunciationsReducer = (
  state: PronunciationsState = defaultState,
  action: StoreAction | PronunciationsAction
): PronunciationsState => {
  switch (action.type) {
    case PronunciationsStatus.Playing:
      return {
        ...defaultState,
        ...action,
      };
    case PronunciationsStatus.Recording:
      return {
        ...defaultState,
        ...action,
      };
    case PronunciationsStatus.Default:
      return defaultState;
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
