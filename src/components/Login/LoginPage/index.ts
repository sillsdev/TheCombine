import { connect } from "react-redux";

import Login, {
  LoginDispatchProps,
  LoginStateProps,
} from "components/Login/LoginPage/LoginComponent";
import {
  asyncLogIn,
  logoutAndResetStore,
} from "components/Login/Redux/LoginActions";
import { reset } from "rootActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState): LoginStateProps {
  return { status: state.loginState.loginStatus };
}

function mapDispatchToProps(dispatch: StoreStateDispatch): LoginDispatchProps {
  return {
    login: (username: string, password: string) => {
      dispatch(asyncLogIn(username, password));
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
