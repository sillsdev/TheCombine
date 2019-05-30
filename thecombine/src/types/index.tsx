import { ThunkAction, ThunkDispatch } from "redux-thunk";

import { TempState } from "../components/Temp/TempReducer";
import { TempAction } from "../components/Temp/TempActions";
import { LocalizeState } from "react-localize-redux";

//root store structure
export interface StoreState {
  localize: LocalizeState;
  tempState: TempState;
}

//root action type
export type TCActions = TempAction; // | otherActions;

//thunk types
export type TCThunkResult<R> = ThunkAction<R, StoreState, null, TCActions>;
export type TCThunkDispatch = ThunkDispatch<StoreState, null, TCActions>;
