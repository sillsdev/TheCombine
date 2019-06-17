import Navigation from "./NavigationComponent";

import { connect } from "react-redux";
import { StoreState } from "../../types/index";
import { NavComponentState } from "../../types/nav";

export function mapStateToProps(state: StoreState): NavComponentState {
  return {
    VisibleComponent: state.navState.VisibleComponent
  };
}

export default connect(mapStateToProps)(Navigation);
