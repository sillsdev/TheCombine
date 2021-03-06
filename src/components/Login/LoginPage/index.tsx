import { connect } from "react-redux";

import {
  asyncLogin,
  loginReset,
  logoutAndResetStore,
} from "components/Login/LoginActions";
import Login, {
  LoginDispatchProps,
  LoginStateProps,
} from "components/Login/LoginPage/LoginComponent";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";

function mapStateToProps(state: StoreState): LoginStateProps {
  return {
    loginAttempt: state.loginState && state.loginState.loginAttempt,
    loginFailure: state.loginState && state.loginState.loginFailure,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch): LoginDispatchProps {
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
