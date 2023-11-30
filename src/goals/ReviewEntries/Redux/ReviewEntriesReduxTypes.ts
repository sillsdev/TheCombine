import { Word } from "api/models";
import { ColumnId } from "goals/ReviewEntries/ReviewEntriesTypes";

export interface ReviewEntriesState {
  words: Word[];
  isRecording: boolean;
  sortBy?: ColumnId;
  wordBeingRecorded?: string;
}

export const defaultState: ReviewEntriesState = {
  words: [],
  isRecording: false,
  sortBy: undefined,
  wordBeingRecorded: undefined,
};
