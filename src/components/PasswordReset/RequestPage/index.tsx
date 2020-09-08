import ResetRequest from "./component";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../types";
import { ResetRequestDispatchProps } from "./component";
import { asyncResetRequest } from "../actions";

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, any>
): ResetRequestDispatchProps {
  return {
    passwordResetRequest: (emailOrUsername: string) => {
      dispatch(asyncResetRequest(emailOrUsername));
    },
  };
}

export default connect(undefined, mapDispatchToProps)(ResetRequest);
