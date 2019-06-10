import Login, { LoginDispatchProps, LoginStateProps } from "./LoginComponent";
import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { asyncLogin, UserAction, register, logout } from "./LoginActions";
import { LoginState } from "./LoginReducer";

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, UserAction>
) {
  return {
    login: (user: string, password: string) => {
      dispatch(asyncLogin(user, password));
    },
    logout: () => {
      dispatch(logout());
    },
    register: (user: string, password: string) => {
      dispatch(register(user, password));
    }
  };
}

function mapStateToProps(state: LoginState): LoginStateProps {
  const { loginAttempt } = state;
  return {
    loginAttempt
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
