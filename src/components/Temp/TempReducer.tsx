import { TempAction } from "components/Temp/TempActions";
import { PRESS_BUTTON } from "components/Temp/TempActions";
import { StoreAction, StoreActions } from "rootActions";

export interface TempState {
  tempText: string;
}

export const defaultState: TempState = {
  tempText: "default text from reducer",
};

export const tempReducer = (
  state: TempState | undefined, //createStore() calls each reducer with undefined state
  action: StoreAction | TempAction
): TempState => {
  if (!state) return defaultState;
  switch (action.type) {
    case PRESS_BUTTON:
      return { ...state, tempText: "BUTTON PRESSED! REDUX WORKING!" };
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
