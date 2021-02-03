import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import { asyncRegister, registerReset } from "components/Login/LoginActions";
import Register, {
  RegisterStateProps,
} from "components/Login/RegisterPage/RegisterComponent";

function mapStateToProps(state: StoreState): RegisterStateProps {
  return {
    inProgress: state.loginState.registerAttempt,
    success: state.loginState.registerSuccess,
    failureMessage: state.loginState.registerFailure,
  };
}

export function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    register: (
      name: string,
      username: string,
      email: string,
      password: string
    ) => {
      dispatch(asyncRegister(name, username, email, password));
    },
    reset: () => {
      dispatch(registerReset());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
