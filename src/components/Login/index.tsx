import Login from "./LoginComponent";
import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { login, UserAction, register } from "./LoginActions";

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, UserAction>
) {
  return {
    login: (user: string, password: string) => {
      dispatch(login(user, password));
    },
    register: (user: string, password: string) => {
      dispatch(register(user, password));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Login);
