import CharacterInventory from "./CharacterInventoryComponent";
import { connect } from "react-redux";
import { StoreState } from "../../types";
import { ThunkDispatch } from "redux-thunk";
import {
  CharacterInventoryAction,
  setInventory,
  uploadInventory
} from "./CharacterInventoryActions";
import { getTranslate } from "react-localize-redux";

function mapStateToProps(state: StoreState) {
  return {
    validCharacters:
      state.characterInventoryState && state.characterInventoryState.inventory,
    currentProject: state.currentProject,
    translate: getTranslate(state.localize)
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CharacterInventoryAction>
) {
  return {
    setInventory: (inventory: string[]) => {
      dispatch(setInventory(inventory));
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
