import { ThunkDispatch } from "redux-thunk";

import { exportLift } from "../../../backend";
import { StoreState } from "../../../types";

export enum ExportStatus {
    Default = "DEFAULT",
    InProgress = "IN_PROGRESS",
    Success = "SUCCESS",
    Failure = "FAILURE",
}

export interface ExportProjectAction {
    type: ExportStatus
    projectId?: string
}

export function asyncExportProject(
    projectId?: string,
){
    return async (
        dispatch: ThunkDispatch<
        StoreState,
        any,
        ExportProjectAction
        >
    ) => {
        dispatch(inProgress(projectId))
        exportLift(projectId).then((res) => {
            //Do something with the result of the export
            console.log(res);
            dispatch(success(projectId))
        }).catch(() => {dispatch(failure(projectId))});
    }
}

export function inProgress(
    projectId?: string,
): ExportProjectAction {
    return {
        type: ExportStatus.InProgress,
        projectId
    };
}

export function success(
    projectId?: string,
): ExportProjectAction {
    return {
        type: ExportStatus.Success,
        projectId
    };
}

export function failure(
    projectId?: string,
): ExportProjectAction {
    return {
        type: ExportStatus.Failure,
        projectId
    };
}