import { type PreloadedState } from "redux";

import { type RootState } from "rootRedux/store";
import { defaultState } from "rootRedux/types";

/** Preloaded values for store when testing */
export const persistedDefaultState: PreloadedState<RootState> = {
  ...defaultState,
  _persist: { rehydrated: false, version: -1 },
};
