import { connect } from "react-redux";

import CharacterListComponent from "goals/CharInventoryCreation/components/CharacterList/CharacterListComponent";
import { setSelectedCharacter } from "goals/CharInventoryCreation/Redux/CharacterInventoryActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

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
