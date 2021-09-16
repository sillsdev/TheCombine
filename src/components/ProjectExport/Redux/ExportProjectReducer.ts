import {
  defaultState,
  ExportProjectAction,
  ExportProjectState,
  ExportStatus,
} from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

export const exportProjectReducer = (
  state: ExportProjectState = defaultState,
  action: StoreAction | ExportProjectAction
): ExportProjectState => {
  switch (action.type) {
    case ExportStatus.Exporting:
    case ExportStatus.Downloading:
    case ExportStatus.Success:
    case ExportStatus.Failure:
      return {
        ...defaultState,
        projectId: action.projectId ?? "",
        status: action.type,
      };
    case ExportStatus.Default:
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
