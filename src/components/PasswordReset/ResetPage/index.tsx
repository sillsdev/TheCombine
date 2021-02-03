import { connect } from "react-redux";

import { asyncReset } from "components/PasswordReset/actions";
import PasswordReset, {
  ResetDispatchProps,
} from "components/PasswordReset/ResetPage/component";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";

function mapStateToProps(state: StoreState) {
  return {
    resetState: state.passwordResetState.resetState,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch): ResetDispatchProps {
  return {
    passwordReset: (token: string, password: string) => {
      dispatch(asyncReset(token, password));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PasswordReset);
