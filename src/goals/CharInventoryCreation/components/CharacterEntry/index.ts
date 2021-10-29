import { connect } from "react-redux";

import {
  setRejectedCharacters,
  setValidCharacters,
} from "goals/CharInventoryCreation/Redux/CharacterInventoryActions";
import CharacterEntry from "goals/CharInventoryCreation/components/CharacterEntry/CharacterEntryComponent";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState) {
  return {
    validCharacters: state.characterInventoryState.validCharacters,
    rejectedCharacters: state.characterInventoryState.rejectedCharacters,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
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
