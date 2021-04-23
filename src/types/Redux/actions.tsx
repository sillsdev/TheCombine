import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { StoreState } from "types";

export interface ActionWithPayload<T> extends Action {
  payload: T;
}

// https://redux.js.org/recipes/usage-with-typescript#usage-with-redux-thunk
// suggests a custom general type for ThunkAction,
// so in like fashion, here's one for ThunkDispatch:
export type StoreStateDispatch = ThunkDispatch<StoreState, any, Action>;
