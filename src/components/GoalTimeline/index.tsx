import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { GoalTimeline } from "./GoalTimelineComponent";
import { LoadUserEdits, asyncGetUserEdits } from "./GoalsActions";

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, LoadUserEdits>
) {
  return {
    loadHistory: () => {
      dispatch(asyncGetUserEdits());
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(GoalTimeline);
