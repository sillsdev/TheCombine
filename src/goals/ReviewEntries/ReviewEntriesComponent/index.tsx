import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import ReviewEntriesComponent from "./ReviewEntriesComponent";
import { ReviewEntriesWord } from "./ReviewEntriesTypes";
import {
  ReviewEntriesAction,
  updateAllWords,
  updateFrontierWord,
  clearReviewEntriesState,
} from "./ReviewEntriesActions";
import { StoreState } from "../../../types";

function mapStateToProps(state: StoreState) {
  return {
    //Needs to be changed if we allow multiple Analysis Writing Systems
    language: state.currentProject.analysisWritingSystems[0].bcp47,
    words: state.reviewEntriesState.words,
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ReviewEntriesAction>
) {
  return {
    clearState: () => dispatch(clearReviewEntriesState()),
    updateAllWords: (words: ReviewEntriesWord[]) =>
      dispatch(updateAllWords(words)),
    updateFrontierWord: (
      newData: ReviewEntriesWord,
      oldData: ReviewEntriesWord,
      language: string
    ) => dispatch(updateFrontierWord(newData, oldData, language)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewEntriesComponent);
