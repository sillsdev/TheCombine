export enum ExportStatus {
  Default = "DEFAULT",
  InProgress = "IN_PROGRESS",
  Success = "SUCCESS",
  Failure = "FAILURE",
}

export interface ExportProjectAction {
  type: ExportStatus;
  projectId?: string;
}

export interface ExportProjectState {
  projectId: string;
  status: ExportStatus;
}

export const defaultState: ExportProjectState = {
  projectId: "",
  status: ExportStatus.Default,
};
