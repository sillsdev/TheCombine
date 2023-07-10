import { connect } from "react-redux";

import {
  updateAllWords,
  updateFrontierWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesActions";
import ReviewEntriesComponent from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesComponent";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreStateDispatch } from "types/Redux/actions";

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    updateAllWords: (words: ReviewEntriesWord[]) =>
      dispatch(updateAllWords(words)),
    updateFrontierWord: (
      newData: ReviewEntriesWord,
      oldData: ReviewEntriesWord
    ) => dispatch(updateFrontierWord(newData, oldData)),
  };
}

export default connect(null, mapDispatchToProps)(ReviewEntriesComponent);
