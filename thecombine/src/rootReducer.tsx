import { combineReducers, Reducer } from "redux";
import { ThunkAction } from "redux-thunk";

import { StoreState } from "./types";
import { tempReducer } from "./components/Temp/TempReducer";
import { TempAction } from "./components/Temp/TempActions";

export type TheCombineAction = TempAction; // | otherActions;

export type ThunkResult<R> = ThunkAction<R, StoreState, null, TheCombineAction>;

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
  tempState: tempReducer
});
