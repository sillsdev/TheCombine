import CharacterStatusControl from "./CharacterStatusControl";
import { connect } from "react-redux";
import { StoreState } from "../../../../../types";
import {
  CharacterInventoryAction,
  setCharacterStatus
} from "../../../CharacterInventoryActions";
import { ThunkDispatch } from "redux-thunk";

function mapStateToProps(state: StoreState) {
  return {
    validCharacters: state.characterInventoryState.validCharacters
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CharacterInventoryAction>
) {
  return {
    accept: (character: string) => {
      dispatch(setCharacterStatus(character, "accepted"));
    },
    reject: (character: string) => {
      dispatch(setCharacterStatus(character, "rejected"));
    },
    unset: (character: string) => {
      dispatch(setCharacterStatus(character, "undecided"));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterStatusControl);
