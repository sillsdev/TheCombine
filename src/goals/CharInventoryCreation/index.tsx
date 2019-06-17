import CharacterInventory from "./CharacterInventoryComponent";
import { connect } from "react-redux";
import { StoreState } from "../../types";
import { ThunkDispatch } from "redux-thunk";
import {
  CharacterInventoryAction,
  setInventory,
  uploadInventory
} from "./CharacterInventoryActions";
import { CharacterInventoryState } from "./CharacterInventoryReducer";

function mapStateToProps(state: StoreState): CharacterInventoryState {
  return {
    inventory:
      state.characterInventoryState && state.characterInventoryState.inventory
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CharacterInventoryAction>
) {
  return {
    setInventory: (inventory: string[]) => {
      dispatch(setInventory(inventory));
    },
    uploadInventory: () => {
      uploadInventory();
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterInventory);
