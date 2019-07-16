import CharacterInventory from "./CharacterInventoryComponent";
import { connect } from "react-redux";
import { StoreState } from "../../types";
import { ThunkDispatch } from "redux-thunk";
import {
  CharacterInventoryAction,
  setAcceptedCharacters,
  uploadInventory,
  setRejectedCharacters
} from "./CharacterInventoryActions";
import { getTranslate } from "react-localize-redux";

function mapStateToProps(state: StoreState) {
  return {
    validCharacters:
      state.characterInventoryState &&
      state.characterInventoryState.acceptedCharacters,
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
    setAcceptedCharacters: (inventory: string[]) => {
      dispatch(setAcceptedCharacters(inventory));
    },
    setRejectedCharacters: (inventory: string[]) => {
      dispatch(setRejectedCharacters(inventory));
    },
    uploadInventory: () => {
      dispatch(uploadInventory());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterInventory);
