import {
  ColumnId,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesTypes";

export enum ReviewEntriesActionTypes {
  SortBy = "SORT_BY",
  UpdateAllWords = "UPDATE_ALL_WORDS",
  UpdateWord = "UPDATE_WORD",
  ClearReviewEntriesState = "CLEAR_REVIEW_ENTRIES_STATE",
}

export interface ReviewSortBy {
  type: ReviewEntriesActionTypes.SortBy;
  sortBy?: ColumnId;
}

export interface ReviewUpdateWords {
  type: ReviewEntriesActionTypes.UpdateAllWords;
  words: ReviewEntriesWord[];
}

export interface ReviewUpdateWord {
  type: ReviewEntriesActionTypes.UpdateWord;
  oldId: string;
  updatedWord: ReviewEntriesWord;
}

export interface ReviewClearReviewEntriesState {
  type: ReviewEntriesActionTypes.ClearReviewEntriesState;
}

export type ReviewEntriesAction =
  | ReviewSortBy
  | ReviewUpdateWords
  | ReviewUpdateWord
  | ReviewClearReviewEntriesState;

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
