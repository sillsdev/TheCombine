import Login, { LoginStateProps, LoginDispatchProps } from "./LoginComponent";
import { StoreState } from "../../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  asyncLogin,
  UserAction,
  loginReset,
  logoutUser
} from "../LoginActions";

function mapStateToProps(state: StoreState): LoginStateProps {
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
      dispatch(logoutUser());
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
