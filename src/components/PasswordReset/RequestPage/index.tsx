import { connect } from "react-redux";

import { StoreStateDispatch } from "types/actions";
import { asyncResetRequest } from "components/PasswordReset/actions";
import ResetRequest, {
  ResetRequestDispatchProps,
} from "components/PasswordReset/RequestPage/component";

export function mapDispatchToProps(
  dispatch: StoreStateDispatch
): ResetRequestDispatchProps {
  return {
    passwordResetRequest: (emailOrUsername: string) => {
      dispatch(asyncResetRequest(emailOrUsername));
    },
  };
}

export default connect(undefined, mapDispatchToProps)(ResetRequest);
