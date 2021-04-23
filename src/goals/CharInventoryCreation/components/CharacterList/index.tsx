import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { setSelectedCharacter } from "goals/CharInventoryCreation/Redux/CharacterInventoryActions";
import CharacterListComponent from "goals/CharInventoryCreation/components/CharacterList/CharacterListComponent";

function mapStateToProps(state: StoreState) {
  return {
    allCharacters: state.characterInventoryState.characterSet,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setSelectedCharacter: (character: string) => {
      dispatch(setSelectedCharacter(character));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterListComponent);
