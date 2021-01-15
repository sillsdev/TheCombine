import { connect } from "react-redux";

import { StoreState } from "../../../../types";
import { StoreStateDispatch } from "../../../../types/actions";
import { setSelectedCharacter } from "../../CharacterInventoryActions";
import CharacterListComponent from "./CharacterListComponent";

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
