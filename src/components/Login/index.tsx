import Login, { LoginStateProps } from "./LoginComponent";
import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { asyncLogin, UserAction, register, logout } from "./LoginActions";

function mapStateToProps(state: StoreState): LoginStateProps {
  console.log(state);
  return {
    loginAttempt: state.loginState.loginAttempt
  };
}

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
