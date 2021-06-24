export enum PronunciationsStatus {
  Default = "DEFAULT",
  Playing = "PLAYING",
  Recording = "RECORDING",
}

export interface PronunciationsAction {
  type: PronunciationsStatus;
  payload?: string;
}

export interface PronunciationsState {
  type: PronunciationsStatus;
  payload: string;
}

export const defaultState: PronunciationsState = {
  type: PronunciationsStatus.Default,
  payload: "",
};
