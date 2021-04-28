import { StoreAction, StoreActionTypes } from "rootActions";
import {} from "components/ProjectExport/Redux/ExportProjectActions";
import {
  defaultState,
  ExportProjectAction,
  ExportProjectState,
  ExportStatus,
} from "components/ProjectExport/Redux/ExportProjectReduxTypes";

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
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
