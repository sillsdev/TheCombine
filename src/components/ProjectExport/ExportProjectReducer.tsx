import { StoreAction, StoreActions } from "rootActions";
import {
  ExportProjectAction,
  ExportStatus,
} from "components/ProjectExport/ExportProjectActions";

export interface ExportProjectState {
  projectId: string;
  status: ExportStatus;
}

export const defaultState: ExportProjectState = {
  projectId: "",
  status: ExportStatus.Default,
};

export const exportProjectReducer = (
  state: ExportProjectState = defaultState,
  action: StoreAction | ExportProjectAction
): ExportProjectState => {
  switch (action.type) {
    case ExportStatus.InProgress:
      return {
        ...defaultState,
        projectId: action.projectId ?? "",
        status: action.type,
      };
    case ExportStatus.Success:
      return {
        ...defaultState,
        projectId: action.projectId ?? "",
        status: action.type,
      };
    case ExportStatus.Failure:
      return {
        ...defaultState,
        projectId: action.projectId ?? "",
        status: action.type,
      };
    case ExportStatus.Default:
      return defaultState;
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
