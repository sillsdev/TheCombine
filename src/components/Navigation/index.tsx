import { Navigation } from "./NavigationComponent";

import { connect } from "react-redux";
import { StoreState } from "../../types/index";
import { NavState } from "../../types/nav";
import Stack from "../../types/stack";

export function mapStateToProps(state: StoreState): NavState {
  return {
    PreviousComponent: state.navState.PreviousComponent,
    VisibleComponent: state.navState.VisibleComponent,
    DisplayHistory: new Stack<JSX.Element>([]),
    GoBack: () => console.log("Go Back")
  };
}

export default connect(mapStateToProps)(Navigation);
