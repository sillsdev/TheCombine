export enum PronunciationsStatus {
  Inactive = "INACTIVE",
  Playing = "PLAYING",
  Recording = "RECORDING",
}

export interface PronunciationsState {
  fileName: string;
  status: PronunciationsStatus;
  wordId: string;
}

export const defaultState: PronunciationsState = {
  fileName: "",
  status: PronunciationsStatus.Inactive,
  wordId: "",
};
