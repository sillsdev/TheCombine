export enum StoreActions {
  RESET = "RESET"
}

interface Reset {
  type: StoreActions.RESET;
}

export type StoreAction = Reset;
