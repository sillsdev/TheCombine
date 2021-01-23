import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import * as actions from "components/Temp/TempActions";
import Temp from "components/Temp/TempComponent";

//Temp Container Component

export function mapStateToProps(state: StoreState) {
  return {
    text: state.tempState.tempText,
  };
}

export function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    buttonClicked: () => {
      //console.log('clicked test!');
      dispatch(actions.asyncPressButton());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Temp);
