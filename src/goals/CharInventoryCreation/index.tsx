import CharacterInventory from "./CharacterInventoryComponent";
import { connect } from "react-redux";
import { StoreState } from "../../types";
import { ThunkDispatch } from "redux-thunk";
import {
  CharacterInventoryAction,
  setValidCharacters,
  uploadInventory,
  setRejectedCharacters,
  addToValidCharacters,
  fetchWords
} from "./CharacterInventoryActions";
import { getTranslate } from "react-localize-redux";

function mapStateToProps(state: StoreState) {
  return {
    validCharacters:
      state.characterInventoryState &&
      state.characterInventoryState.validCharacters,
    rejectedCharacters:
      state.characterInventoryState &&
      state.characterInventoryState.rejectedCharacters,
    currentProject: state.currentProject,
    translate: getTranslate(state.localize)
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CharacterInventoryAction>
) {
  return {
    addToValidCharacters: (chars: string[]) => {
      dispatch(addToValidCharacters(chars));
    },
    setValidCharacters: (inventory: string[]) => {
      dispatch(setValidCharacters(inventory));
    },
    setRejectedCharacters: (inventory: string[]) => {
      dispatch(setRejectedCharacters(inventory));
    },
    uploadInventory: () => {
      dispatch(uploadInventory());
    },
    fetchWords: () => {
      dispatch(fetchWords());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterInventory);
