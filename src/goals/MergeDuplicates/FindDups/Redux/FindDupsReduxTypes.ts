export enum FindDupsStatus {
  Default = "DEFAULT",
  InProgress = "IN_PROGRESS",
  Success = "SUCCESS",
  Failure = "FAILURE",
}

export interface FindDupsState {
  projectId: string;
  status: FindDupsStatus;
}

export const defaultState: FindDupsState = {
  projectId: "",
  status: FindDupsStatus.Default,
};
