import RegisterInvite, {
  RegisterInviteStateProps,
} from "./RegisterInviteComponent";
import { StoreState } from "../../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { UserAction, asyncRegister, registerReset } from "../LoginActions";

function mapStateToProps(state: StoreState): RegisterInviteStateProps {
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
      dispatch(asyncRegister(name, user, email, password));
    },
    reset: () => {
      dispatch(registerReset());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterInvite);
