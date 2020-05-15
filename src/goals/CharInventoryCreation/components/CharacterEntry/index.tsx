import { connect } from "react-redux";
import { StoreState } from "../../../../types";
import { ThunkDispatch } from "redux-thunk";
import {
  CharacterInventoryAction,
  setValidCharacters,
  setRejectedCharacters,
} from "../../CharacterInventoryActions";
import CharacterEntry from "./CharacterEntryComponent";

function mapStateToProps(state: StoreState) {
  return {
    validCharacters: state.characterInventoryState.validCharacters,
    rejectedCharacters: state.characterInventoryState.rejectedCharacters,
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CharacterInventoryAction>
) {
  return {
    setValidCharacters: (inventory: string[]) => {
      dispatch(setValidCharacters(inventory));
    },
    setRejectedCharacters: (inventory: string[]) => {
      dispatch(setRejectedCharacters(inventory));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterEntry);
