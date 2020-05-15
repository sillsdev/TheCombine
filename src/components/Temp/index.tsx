import Temp from "./TempComponent";
import * as actions from "./TempActions";
import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

//Temp Container Component

export function mapStateToProps(state: StoreState) {
  return {
    text: state.tempState.tempText,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, actions.TempAction>
) {
  return {
    buttonClicked: () => {
      //console.log('clicked test!');
      dispatch(actions.asyncPressButton());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Temp);
