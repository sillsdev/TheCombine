export enum StoreActionTypes {
  RESET = "RESET",
}

interface Reset {
  type: StoreActionTypes.RESET;
}

export type StoreAction = Reset;

export function reset(): StoreAction {
  return {
    type: StoreActionTypes.RESET,
  };
}
