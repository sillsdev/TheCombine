import { connect } from "react-redux";

import { asyncSignUp } from "components/Login/Redux/LoginActions";
import ProjectInvite, {
  ProjectInviteStateProps,
} from "components/ProjectInvite/ProjectInviteComponent";
import { reset } from "rootActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState): ProjectInviteStateProps {
  return {
    inProgress: state.loginState.signUpAttempt,
    success: state.loginState.signUpSuccess,
    failureMessage: state.loginState.signUpFailure,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    signUp: (name: string, user: string, email: string, password: string) => {
      dispatch(asyncSignUp(name, user, email, password));
    },
    reset: () => {
      dispatch(reset());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectInvite);
