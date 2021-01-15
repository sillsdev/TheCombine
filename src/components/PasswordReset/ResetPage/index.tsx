import { connect } from "react-redux";

import { StoreState } from "../../../types";
import { StoreStateDispatch } from "../../../types/actions";
import { asyncReset } from "../actions";
import PasswordReset, { ResetDispatchProps } from "./component";

export function mapStateToProps(state: StoreState) {
  return {
    resetState: state.passwordResetState.resetState,
  };
}

export function mapDispatchToProps(
  dispatch: StoreStateDispatch
): ResetDispatchProps {
  return {
    passwordReset: (token: string, password: string) => {
      dispatch(asyncReset(token, password));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PasswordReset);
