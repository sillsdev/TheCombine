import { Navigation } from "./NavComponent";

import { connect } from "react-redux";
import { StoreState } from "../../types/index";
import { NavState } from "../../types/nav";

export function mapStateToProps(state: StoreState): NavState {
  return {
    VisibleComponent: state.navState.VisibleComponent
  };
}

export default connect(mapStateToProps)(Navigation);
