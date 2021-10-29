import { connect } from "react-redux";

import { setCharacterStatus } from "goals/CharInventoryCreation/Redux/CharacterInventoryActions";
import { CharacterStatus } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import CharacterStatusControl from "goals/CharInventoryCreation/components/CharacterDetail/CharacterStatusControl/CharacterStatusControl";
import { StoreStateDispatch } from "types/Redux/actions";

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
