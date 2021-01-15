import CharacterStatusControl from "./CharacterStatusControl";
import { connect } from "react-redux";

import { StoreStateDispatch } from "../../../../../types/actions";
import { setCharacterStatus } from "../../../CharacterInventoryActions";

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    accept: (character: string) => {
      dispatch(setCharacterStatus(character, "accepted"));
    },
    reject: (character: string) => {
      dispatch(setCharacterStatus(character, "rejected"));
    },
    unset: (character: string) => {
      dispatch(setCharacterStatus(character, "undecided"));
    },
  };
}

export default connect(null, mapDispatchToProps)(CharacterStatusControl);
