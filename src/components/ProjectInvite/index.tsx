import { connect } from "react-redux";

import { StoreState } from "../../types";
import { StoreStateDispatch } from "../../types/actions";
import {
  asyncRegisterForEmailInvite,
  registerReset,
} from "../Login/LoginActions";
import ProjectInvite, {
  ProjectInviteStateProps,
} from "./ProjectInviteComponent";

function mapStateToProps(state: StoreState): ProjectInviteStateProps {
  return {
    inProgress: state.loginState.registerAttempt,
    success: state.loginState.registerSuccess,
    failureMessage: state.loginState.registerFailure,
  };
}

export function mapDispatchToProps(dispatch: StoreStateDispatch) {
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
