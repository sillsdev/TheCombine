import CharacterListComponent from "./CharacterListComponent";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  CharacterInventoryAction,
  setValidCharacters,
  setRejectedCharacters
} from "../../CharacterInventoryActions";
import { StoreState } from "../../../../types";

function mapStateToProps(state: StoreState) {
  return {
    validCharacters:
      state.characterInventoryState &&
      state.characterInventoryState.validCharacters,
    rejectedCharacters:
      state.characterInventoryState &&
      state.characterInventoryState.rejectedCharacters,
    allWords:
      state.characterInventoryState && state.characterInventoryState.allWords
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
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterListComponent);
