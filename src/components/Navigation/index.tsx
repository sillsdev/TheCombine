import Navigation from "./NavigationComponent";

import { connect } from "react-redux";
import { StoreState } from "../../types/index";
import { NavState } from "../../types/nav";
import Stack from "../../types/stack";
import { ThunkDispatch } from "redux-thunk";
import * as actions from "./NavigationActions";

export function mapStateToProps(state: StoreState): NavState {
  return {
    VisibleComponent: state.navState.VisibleComponent,
    DisplayHistory: new Stack<JSX.Element>([]),
    NavBarState: {
      ShouldRenderBackButton: false
    }
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
)(Navigation);
