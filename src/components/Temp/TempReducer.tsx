import { TempAction } from "./TempActions";
import { PRESS_BUTTON } from "./TempActions";

export interface TempState {
  tempText: string;
}

export const defaultState: TempState = {
  tempText: "default text from reducer"
};

export const tempReducer = (
  state: TempState | undefined, //createStore() calls each reducer with undefined state
  action: TempAction
): TempState => {
  //console.log('reducer reached');
  if (!state) return defaultState;
  switch (action.type) {
    case PRESS_BUTTON:
      return { ...state, tempText: "BUTTON PRESSED! REDUX WORKING!" };
    default:
      return state;
  }
};
