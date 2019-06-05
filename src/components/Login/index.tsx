import Login from "./LoginComponent";
import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { login, UserAction, REGISTER } from "./LoginActions";

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, UserAction>
) {
  return {
    login: (user: string, password: String) => {
      //console.log('clicked test!');
      dispatch(login(user, password));
    },
    register: (user: string, password: String) => {
      //console.log('clicked test!');
      dispatch(login(user, password, REGISTER));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Login);
