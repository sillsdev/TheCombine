import Temp from "./Temp";
import * as actions from "./TempActions";
import { StoreState } from "../../types";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

export function mapStateToProps(state: StoreState) {
  return {
    text: state.tempState.tempText
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, actions.TempAction>
) {
  return {
    buttonClicked: () => {
      console.log("clicked button!");
      dispatch(actions.pressButton());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Temp);
