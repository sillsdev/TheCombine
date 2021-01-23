import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { findAndReplace } from "goals/CharInventoryCreation/components/CharacterDetail/FindAndReplace/FindAndReplaceActions";
import FindAndReplace from "goals/CharInventoryCreation/components/CharacterDetail/FindAndReplace/FindAndReplaceComponent";

function mapStateToProps(state: StoreState) {
  return {
    allWords: state.characterInventoryState.allWords,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    findAndReplace: (findValue: string, replaceValue: string) => {
      dispatch(findAndReplace(findValue, replaceValue));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FindAndReplace);
