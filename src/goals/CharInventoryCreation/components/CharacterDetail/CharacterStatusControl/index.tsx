import CharacterStatusControl from "./CharacterStatusControl";
import { connect } from "react-redux";
import { StoreState } from "../../../../../types";

function mapStateToProps(state: StoreState) {
  return {};
}

export default connect(
  mapStateToProps,
  null
)(CharacterStatusControl);
