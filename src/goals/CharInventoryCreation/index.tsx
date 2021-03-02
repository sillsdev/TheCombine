import { connect } from "react-redux";

import {
  fetchWords,
  getAllCharacters,
  resetAndExit,
  setRejectedCharacters,
  setSelectedCharacter,
  setValidCharacters,
  uploadInventory,
} from "goals/CharInventoryCreation/CharacterInventoryActions";
import CharacterInventory from "goals/CharInventoryCreation/CharacterInventoryComponent";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { Goal } from "types/goals";

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
    uploadInventory: (goal: Goal) => dispatch(uploadInventory(goal)),
    fetchWords: () => dispatch(fetchWords()),
    getAllCharacters: () => dispatch(getAllCharacters()),
    quit: () => dispatch(resetAndExit()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterInventory);
