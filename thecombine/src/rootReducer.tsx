import { combineReducers, Reducer } from "redux";

import { StoreState } from "./types";
import { tempReducer } from "./components/Temp/TempReducer";

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
  tempState: tempReducer
});
