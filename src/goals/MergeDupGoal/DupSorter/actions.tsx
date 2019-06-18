import { SortStyle } from "./DupSorter";

export const SORT_ACTION = "SORT_ACTION";
export type SORT_ACTION = typeof SORT_ACTION;

export type SortActionType = SORT_ACTION; // | any additional actions

export interface SortAction {
  type: SortActionType;
  payload: SortStyle;
}

export function changeSortStyle(newStyle: SortStyle): SortAction {
  return {
    type: SORT_ACTION,
    payload: newStyle
  };
}
