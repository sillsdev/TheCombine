import { type RootState } from "rootRedux/store";
import { defaultState } from "rootRedux/types";

/** Preloaded values for store when testing */
export const persistedDefaultState: RootState = {
  ...defaultState,
  _persist: { rehydrated: false, version: -1 },
};
