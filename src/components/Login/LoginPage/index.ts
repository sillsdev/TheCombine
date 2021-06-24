import { connect } from "react-redux";

import Login, {
  LoginDispatchProps,
  LoginStateProps,
} from "components/Login/LoginPage/LoginComponent";
import {
  asyncLogin,
  logoutAndResetStore,
} from "components/Login/Redux/LoginActions";
import { reset } from "rootActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

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
      dispatch(reset());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
