import {
  defaultState,
  PronunciationsAction,
  PronunciationsStatus,
  PronunciationsState,
} from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

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
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
