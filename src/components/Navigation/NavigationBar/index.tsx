import NavigationBar from "./NavigationBarComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types/index";
import { NavBarState } from "../../../types/nav";

export function mapStateToProps(state: StoreState): NavBarState {
  return {
    Title: state.navState.NavBarState.Title
  };
}

export default connect(mapStateToProps)(NavigationBar);
