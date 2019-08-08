import { connect } from "react-redux";
import { StoreState } from "../../types";
import { getTranslate } from "react-localize-redux";
import Pronunciations from "./PronunciationsComponent";

function mapStateToProps(state: StoreState) {
  return {
    translate: getTranslate(state.localize)
  };
}

export default connect(
  mapStateToProps,
  null
)(Pronunciations);
