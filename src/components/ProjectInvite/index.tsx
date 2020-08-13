import ProjectInvite, {
  ProjectInviteStateProps,
} from "./ProjectInviteComponent";
import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  UserAction,
  asyncRegisterForEmailInvite,
  registerReset,
} from "../Login/LoginActions";

function mapStateToProps(state: StoreState): ProjectInviteStateProps {
  return {
    inProgress: state.loginState.registerAttempt,
    success: state.loginState.registerSuccess,
    failureMessage: state.loginState.registerFailure,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, UserAction>
) {
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
