import { connect } from "react-redux";

import { setVern } from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import MergeRowComponent from "goals/MergeDupGoal/MergeDupStep/MergeRow/MergeRowComponent";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";

function mapStateToProps(state: StoreState) {
  return {
    words: state.mergeDuplicateGoal.tree.words,
    data: state.mergeDuplicateGoal.data,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setVern: (wordID: string, vern: string) => {
      dispatch(setVern(wordID, vern));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MergeRowComponent);
