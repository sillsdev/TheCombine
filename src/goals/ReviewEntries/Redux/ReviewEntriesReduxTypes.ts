import {
  ColumnId,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesTypes";

export interface ReviewEntriesState {
  words: ReviewEntriesWord[];
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
