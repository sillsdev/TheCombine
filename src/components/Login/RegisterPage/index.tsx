import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import { StoreState } from "../../../types";
import { asyncRegister, registerReset, UserAction } from "../LoginActions";
import Register, { RegisterStateProps } from "./RegisterComponent";

function mapStateToProps(state: StoreState): RegisterStateProps {
  return {
    inProgress: state.loginState.registerAttempt,
    success: state.loginState.registerSuccess,
    failureMessage: state.loginState.registerFailure,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, UserAction>
) {
  return {
    register: (
      name: string,
      username: string,
      email: string,
      password: string
    ) => {
      dispatch(asyncRegister(name, username, email, password));
    },
    reset: () => {
      dispatch(registerReset());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
