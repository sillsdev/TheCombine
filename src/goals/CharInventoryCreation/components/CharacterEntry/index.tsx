import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import {
  setRejectedCharacters,
  setValidCharacters,
} from "goals/CharInventoryCreation/CharacterInventoryActions";
import CharacterEntry from "goals/CharInventoryCreation/components/CharacterEntry/CharacterEntryComponent";

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
