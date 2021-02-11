import { connect } from "react-redux";

import { StoreStateDispatch } from "types/actions";
import { setCharacterStatus } from "goals/CharInventoryCreation/CharacterInventoryActions";
import CharacterStatusControl from "goals/CharInventoryCreation/components/CharacterDetail/CharacterStatusControl/CharacterStatusControl";
import { CharacterStatus } from "goals/CharInventoryCreation/CharacterInventoryReducer";

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    accept: (character: string) => {
      dispatch(setCharacterStatus(character, CharacterStatus.Accepted));
    },
    reject: (character: string) => {
      dispatch(setCharacterStatus(character, CharacterStatus.Rejected));
    },
    unset: (character: string) => {
      dispatch(setCharacterStatus(character, CharacterStatus.Undecided));
    },
  };
}

export default connect(null, mapDispatchToProps)(CharacterStatusControl);
