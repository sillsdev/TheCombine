import Register, { RegisterStateProps } from "./RegisterComponent";
import { StoreState } from "../../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { asyncLogin, UserAction, logout, asyncRegister } from "../LoginActions";

function mapStateToProps(state: StoreState): RegisterStateProps {
  return {
    inProgress: state.loginState.registerAttempt,
    success: state.loginState.registerSuccess,
    failure: state.loginState.registerFailure
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, UserAction>
) {
  return {
    register: (name: string, user: string, password: string) => {
      dispatch(asyncRegister(name, user, password));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);
