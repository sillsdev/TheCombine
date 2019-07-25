import CharacterStatusControl from "./CharacterStatusControl";
import { connect } from "react-redux";
import { StoreState } from "../../../../../types";
import {
  CharacterInventoryAction,
  addToValidCharacters,
  addToRejectedCharacters
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
    accept: (chars: string) => {
      dispatch(addToValidCharacters([chars]));
    },
    reject: (chars: string) => {
      dispatch(addToRejectedCharacters([chars]));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterStatusControl);
