export enum ExportStatus {
  Default = "DEFAULT",
  Exporting = "EXPORTING",
  Downloading = "DOWNLOADING",
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
