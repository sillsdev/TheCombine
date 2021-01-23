import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import {
  asyncLogin,
  loginReset,
  logoutAndResetStore,
} from "components/Login/LoginActions";
import Login, {
  LoginDispatchProps,
  LoginStateProps,
} from "components/Login/LoginPage/LoginComponent";

function mapStateToProps(state: StoreState): LoginStateProps {
  return {
    loginAttempt: state.loginState && state.loginState.loginAttempt,
    loginFailure: state.loginState && state.loginState.loginFailure,
  };
}

export function mapDispatchToProps(
  dispatch: StoreStateDispatch
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
