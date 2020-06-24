import PasswordReset from "./component";
import { StoreState } from "../../../types";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { ResetAction, asyncReset } from "../actions";
import { ResetDispatchProps } from "./component";

export function mapStateToProps(state: StoreState) {
  return {
    resetAttempt: state.passwordResetState.resetAttempt,
    resetSuccess: state.passwordResetState.resetSuccess,
    resetFailure: state.passwordResetState.resetFailure,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ResetAction>
): ResetDispatchProps {
  return {
    passwordReset: (token: string, password: string) => {
      dispatch(asyncReset(token, password));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PasswordReset);
