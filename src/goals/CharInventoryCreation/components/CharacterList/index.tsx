import CharacterListComponent from "./CharacterListComponent";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  CharacterInventoryAction,
  setSelectedCharacter,
} from "../../CharacterInventoryActions";
import { StoreState } from "../../../../types";

function mapStateToProps(state: StoreState) {
  return {
    allCharacters: state.characterInventoryState.characterSet,
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, CharacterInventoryAction>
) {
  return {
    setSelectedCharacter: (character: string) => {
      dispatch(setSelectedCharacter(character));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterListComponent);
