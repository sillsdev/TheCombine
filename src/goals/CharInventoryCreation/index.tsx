import CharacterInventory, {
  CharacterInventoryProps
} from "./CharacterInventoryComponent";
import { connect } from "react-redux";
import { StoreState } from "../../types";
import { ThunkDispatch } from "redux-thunk";
import {
  CharacterInventoryAction,
  setInventory,
  uploadInventory
} from "./CharacterInventoryActions";
import { CharacterInventoryState } from "./CharacterInventoryReducer";
import { setCurrentProject } from "../../components/Project/ProjectActions";

function mapStateToProps(
  state: StoreState
): CharacterInventoryState | CharacterInventoryProps {
  return {
    inventory:
      state.characterInventoryState && state.characterInventoryState.inventory,
    currentProject: state.currentProject
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
      dispatch(uploadInventory());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterInventory);
