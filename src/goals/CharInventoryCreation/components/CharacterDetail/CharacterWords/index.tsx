import { connect } from "react-redux";

import CharacterWords from "goals/CharInventoryCreation/components/CharacterDetail/CharacterWords/CharacterWordsComponent";
import { StoreState } from "types";

function mapStateToProps(state: StoreState) {
  return {
    allWords: state.characterInventoryState.allWords,
  };
}

export default connect(mapStateToProps, null)(CharacterWords);
