import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

export enum ReviewEntriesActionTypes {
  UpdateAllWords = "UPDATE_ALL_WORDS",
  UpdateWord = "UPDATE_WORD",
  ClearReviewEntriesState = "CLEAR_REVIEW_ENTRIES_STATE",
}

export interface ReviewUpdateWords {
  type: ReviewEntriesActionTypes.UpdateAllWords;
  words: ReviewEntriesWord[];
}

export interface ReviewUpdateWord {
  type: ReviewEntriesActionTypes.UpdateWord;
  oldId: string;
  newWord: ReviewEntriesWord;
}

export interface ReviewClearReviewEntriesState {
  type: ReviewEntriesActionTypes.ClearReviewEntriesState;
}

export type ReviewEntriesAction =
  | ReviewUpdateWords
  | ReviewUpdateWord
  | ReviewClearReviewEntriesState;

export interface ReviewEntriesState {
  words: ReviewEntriesWord[];
  isRecording: boolean;
  wordBeingRecorded: string | undefined;
}

export const defaultState: ReviewEntriesState = {
  words: [],
  isRecording: false,
  wordBeingRecorded: undefined,
};
