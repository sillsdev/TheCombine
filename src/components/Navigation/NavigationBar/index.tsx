import NavigationBar from "./NavigationBarComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types/index";
import * as actions from "../NavigationActions";
import { NavBarState } from "../../../types/nav";
import { Dispatch } from "redux";

export function mapStateToProps(state: StoreState): NavBarState {
  return {
    ShouldRenderBackButton: state.navState.NavBarState.ShouldRenderBackButton
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.NavigateBack>) {
  return {
    GoBack: () => {
      dispatch(actions.navigateBack());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationBar);
