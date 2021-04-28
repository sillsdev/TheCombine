import { connect } from "react-redux";

import {
  asyncRegisterForEmailInvite,
  registerReset,
} from "components/Login/Redux/LoginActions";
import ProjectInvite, {
  ProjectInviteStateProps,
} from "components/ProjectInvite/ProjectInviteComponent";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState): ProjectInviteStateProps {
  return {
    inProgress: state.loginState.registerAttempt,
    success: state.loginState.registerSuccess,
    failureMessage: state.loginState.registerFailure,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    register: (name: string, user: string, email: string, password: string) => {
      dispatch(asyncRegisterForEmailInvite(name, user, email, password));
    },
    reset: () => {
      dispatch(registerReset());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectInvite);
