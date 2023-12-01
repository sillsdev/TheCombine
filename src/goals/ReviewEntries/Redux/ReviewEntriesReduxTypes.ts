import { Word } from "api/models";
import { ColumnId } from "goals/ReviewEntries/ReviewEntriesTypes";

export interface ReviewEntriesState {
  words: Word[];
  sortBy?: ColumnId;
}

export const defaultState: ReviewEntriesState = {
  words: [],
  sortBy: undefined,
};
