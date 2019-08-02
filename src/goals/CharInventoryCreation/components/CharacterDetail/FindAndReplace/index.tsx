import FindAndReplace from "./FindAndReplaceComponent";
import { connect } from "react-redux";
import { StoreState } from "../../../../../types";
import { ThunkDispatch } from "redux-thunk";
import { findAndReplace } from "./FindAndReplaceActions";

function mapStateToProps(state: StoreState) {
  return {
    allWords: state.characterInventoryState.allWords
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<StoreState, any, any>) {
  return {
    findAndReplace: (findValue: string, replaceValue: string) => {
      dispatch(findAndReplace(findValue, replaceValue));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FindAndReplace);
