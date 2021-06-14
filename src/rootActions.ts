import { clearLocalStorage } from "backend/localStorage";

export enum StoreActionTypes {
  RESET = "RESET",
}

interface Reset {
  type: StoreActionTypes.RESET;
}

export type StoreAction = Reset;

export function reset(): StoreAction {
  clearLocalStorage();
  return {
    type: StoreActionTypes.RESET,
  };
}
