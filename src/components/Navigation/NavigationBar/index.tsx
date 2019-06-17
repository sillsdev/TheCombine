import NavigationBar from "./NavigationBarComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types/index";
import { ThunkDispatch } from "redux-thunk";
import * as actions from "../NavigationActions";
import { NavBarState } from "../../../types/nav";

export function mapStateToProps(state: StoreState): NavBarState {
  return {
    ShouldRenderBackButton: state.navState.NavBarState.ShouldRenderBackButton
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, actions.NavigateBack>
) {
  return {
    GoBack: () => {
      dispatch(actions.asyncNavigateBack());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationBar);
