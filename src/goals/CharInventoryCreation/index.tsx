import CharacterInventory from "./CharacterInventoryComponent";
import { connect } from "react-redux";
import { StoreState } from "../../types";
import { ThunkDispatch } from "redux-thunk";
import {
  CharacterInventoryAction,
  setValidCharacters,
  setRejectedCharacters,
  setSelectedCharacter,
  uploadInventory,
  fetchWords,
  getAllCharacters,
} from "./CharacterInventoryActions";
import { getTranslate } from "react-localize-redux";

function mapStateToProps(state: StoreState) {
  return {
    currentProject: state.currentProject,
    translate: getTranslate(state.localize),
    selectedCharacter: state.characterInventoryState.selectedCharacter,
    allCharacters: state.characterInventoryState.characterSet,
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CharacterInventoryAction>
) {
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterInventory);
