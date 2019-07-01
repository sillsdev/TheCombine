import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { GoalTimeline } from "./GoalTimelineComponent";
import { LoadUserEdits, asyncLoadUserEdits } from "./GoalTimelineActions";

export function mapStateToProps(state: StoreState) {}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, LoadUserEdits>
) {
  return {
    loadUserEdits: (id: string) => {
      dispatch(asyncLoadUserEdits(id));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalTimeline);
