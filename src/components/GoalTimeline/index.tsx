import { StoreState } from "../../types";
import { GoalTimeline } from "./GoalTimelineComponent";
import { connect } from "react-redux";

export function mapStateToProps(state: StoreState) {}

export default connect(mapStateToProps)(GoalTimeline);
