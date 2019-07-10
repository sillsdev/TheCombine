import { StoreState } from "../../types";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { GoalTimeline } from "./GoalTimelineComponent";
import { LoadUserEdits, asyncLoadUserEdits } from "./GoalsActions";

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, LoadUserEdits>
) {
  return {
    loadUserEdits: (projectId: string, userEditId: string) => {
      dispatch(asyncLoadUserEdits(projectId, userEditId));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(GoalTimeline);
