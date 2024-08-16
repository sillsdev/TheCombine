import { type PreloadedState } from "redux";

import { type RootState } from "rootRedux/store";
import { defaultState } from "rootRedux/types";

/** Preloaded values for store when testing */
export const persistedDefaultState: PreloadedState<RootState> = {
  ...defaultState,
  _persist: { version: 1, rehydrated: false },
};
