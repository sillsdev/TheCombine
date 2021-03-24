import { connect } from "react-redux";

import { setVern } from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import MergeRowComponent from "goals/MergeDupGoal/MergeDupStep/MergeRow/MergeRowComponent";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";

function mapStateToProps(state: StoreState) {
  return {
    treeState: state.mergeDuplicateGoal,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setVern: (wordId: string, vern: string) => {
      dispatch(setVern(wordId, vern));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MergeRowComponent);
