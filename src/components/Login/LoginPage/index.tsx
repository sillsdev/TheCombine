import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import { StoreState } from "../../../types";
import {
  asyncLogin,
  loginReset,
  logoutAndResetStore,
  UserAction,
} from "../LoginActions";
import Login, { LoginDispatchProps, LoginStateProps } from "./LoginComponent";

function mapStateToProps(state: StoreState): LoginStateProps {
  return {
    loginAttempt: state.loginState && state.loginState.loginAttempt,
    loginFailure: state.loginState && state.loginState.loginFailure,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, UserAction>
): LoginDispatchProps {
  return {
    login: (username: string, password: string) => {
      dispatch(asyncLogin(username, password));
    },
    logout: () => {
      dispatch(logoutAndResetStore());
    },
    reset: () => {
      dispatch(loginReset());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
