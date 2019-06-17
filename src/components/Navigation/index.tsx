import Navigation, { NavComponentProps } from "./NavigationComponent";

import { connect } from "react-redux";
import { StoreState } from "../../types/index";

export function mapStateToProps(state: StoreState): NavComponentProps {
  return {
    VisibleComponentName: state.navState.VisibleComponentName
  };
}

export default connect(mapStateToProps)(Navigation);
