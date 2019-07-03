import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import {dragWord, dropWord, WordDragAction} from "../../../../../components/DraggableWord/actions";
import {StoreState} from "../../../../../types";
import {MergeTreeAction} from "../../actions";
import StackDisplayComponent from "./component";
import {MergeTreeReference} from '../../MergeDupsTree';

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.mergeDuplicateGoal.wordDragState.draggedWord
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction | WordDragAction>
) {
  return {
    dropWord: () => {
      dispatch(dropWord());
    },
    dragWord: (ref: MergeTreeReference) => {
      dispatch(dragWord(ref));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StackDisplayComponent);
