import { connect } from "react-redux";

import { StoreState } from "types";
import CharacterWords from "goals/CharInventoryCreation/components/CharacterDetail/CharacterWords/CharacterWordsComponent";

function mapStateToProps(state: StoreState) {
  return {
    allWords: state.characterInventoryState.allWords,
  };
}

export default connect(mapStateToProps, null)(CharacterWords);
