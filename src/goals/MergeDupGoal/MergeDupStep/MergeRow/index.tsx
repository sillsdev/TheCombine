import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import {dropWord, WordDragAction} from "../../../../components/DraggableWord/actions";
import {StoreState} from "../../../../types";
import {MergeTreeAction} from "../actions";
import MergeRowComponent from "./component";

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
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeRowComponent);
