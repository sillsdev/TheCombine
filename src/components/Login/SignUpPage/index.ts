import { connect } from "react-redux";

import { asyncSignUp } from "components/Login/Redux/LoginActions";
import SignUp, {
  SignUpStateProps,
} from "components/Login/SignUpPage/SignUpComponent";
import { reset } from "rootActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState): SignUpStateProps {
  return {
    failureMessage: state.loginState.error,
    status: state.loginState.signupStatus,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    signUp: (
      name: string,
      username: string,
      email: string,
      password: string
    ) => {
      dispatch(asyncSignUp(name, username, email, password));
    },
    reset: () => dispatch(reset()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
