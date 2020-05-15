import CharacterWords from "./CharacterWordsComponent";
import { connect } from "react-redux";
import { StoreState } from "../../../../../types";

function mapStateToProps(state: StoreState) {
  return {
    allWords: state.characterInventoryState.allWords,
  };
}

export default connect(mapStateToProps, null)(CharacterWords);
