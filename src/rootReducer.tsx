import { combineReducers, Reducer } from "redux";

import { StoreState } from "./types";
import { tempReducer } from "./components/Temp/TempReducer";
import { localizeReducer } from "react-localize-redux";

export const rootReducer: Reducer<StoreState> = combineReducers<StoreState>({
  localize: localizeReducer,
  tempState: tempReducer
});
