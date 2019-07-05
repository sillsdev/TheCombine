import Login, { LoginStateProps, LoginDispatchProps } from "./LoginComponent";
import { StoreState } from "../../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { asyncLogin, UserAction, logout, loginReset } from "../LoginActions";

function mapStateToProps(state: StoreState): LoginStateProps {
  //console.log(state);
  return {
    loginAttempt: state.loginState && state.loginState.loginAttempt,
    loginFailure: state.loginState && state.loginState.loginFailure
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, UserAction>
): LoginDispatchProps {
  return {
    login: (user: string, password: string) => {
      dispatch(asyncLogin(user, password));
    },
    logout: () => {
      dispatch(logout());
    },
    reset: () => {
      dispatch(loginReset());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
