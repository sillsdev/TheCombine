import { connect } from "react-redux";

import CharacterInfo from "goals/CharInventoryCreation/components/CharacterDetail/CharacterInfo/CharacterInfoComponent";
import { StoreState } from "types";

function mapStateToProps(state: StoreState) {
  return {
    allWords: state.characterInventoryState.allWords,
  };
}

export default connect(mapStateToProps, null)(CharacterInfo);
