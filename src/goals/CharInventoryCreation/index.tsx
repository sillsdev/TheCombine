import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import {
  fetchWords,
  getAllCharacters,
  resetInState,
  setRejectedCharacters,
  setSelectedCharacter,
  setValidCharacters,
  uploadInventory,
} from "goals/CharInventoryCreation/CharacterInventoryActions";
import CharacterInventory from "goals/CharInventoryCreation/CharacterInventoryComponent";

function mapStateToProps(state: StoreState) {
  return {
    currentProject: state.currentProject,
    selectedCharacter: state.characterInventoryState.selectedCharacter,
    allCharacters: state.characterInventoryState.characterSet,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setValidCharacters: (inventory: string[]) =>
      dispatch(setValidCharacters(inventory)),
    setRejectedCharacters: (inventory: string[]) =>
      dispatch(setRejectedCharacters(inventory)),
    setSelectedCharacter: (character: string) =>
      dispatch(setSelectedCharacter(character)),
    uploadInventory: () => dispatch(uploadInventory()),
    fetchWords: () => dispatch(fetchWords()),
    getAllCharacters: () => dispatch(getAllCharacters()),
    resetInState: () => dispatch(resetInState()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterInventory);
