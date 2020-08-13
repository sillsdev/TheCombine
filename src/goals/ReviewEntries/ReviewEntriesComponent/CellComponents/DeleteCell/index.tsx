import { connect } from "react-redux";

import DeleteCell from "./DeleteCell";
import { StoreState } from "../../../../../types";
import {
  ReviewEntriesAction,
  updateAllWords,
} from "../../ReviewEntriesActions";
import { ThunkDispatch } from "redux-thunk";
import { ReviewEntriesWord } from "../../ReviewEntriesTypes";

function mapStateToProps(state: StoreState) {
  return {
    words: state.reviewEntriesState.words,
  };
}
function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ReviewEntriesAction>
) {
  return {
    updateAllWords: (words: ReviewEntriesWord[]) =>
      dispatch(updateAllWords(words)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteCell);
