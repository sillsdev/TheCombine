import { connect } from "react-redux";

import { asyncResetRequest } from "components/PasswordReset/Redux/ResetActions";
import ResetRequest, {
  ResetRequestDispatchProps,
} from "components/PasswordReset/RequestPage/component";
import { StoreStateDispatch } from "types/Redux/actions";

function mapDispatchToProps(
  dispatch: StoreStateDispatch
): ResetRequestDispatchProps {
  return {
    passwordResetRequest: (emailOrUsername: string) => {
      dispatch(asyncResetRequest(emailOrUsername));
    },
  };
}

export default connect(undefined, mapDispatchToProps)(ResetRequest);
