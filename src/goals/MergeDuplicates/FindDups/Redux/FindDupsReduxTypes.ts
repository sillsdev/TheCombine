export enum FindDupsStatus {
  Default = "DEFAULT",
  InProgress = "IN_PROGRESS",
  Success = "SUCCESS",
  Failure = "FAILURE",
}

export interface FindDupsState {
  status: FindDupsStatus;
}

export const defaultState: FindDupsState = {
  status: FindDupsStatus.Default,
};
