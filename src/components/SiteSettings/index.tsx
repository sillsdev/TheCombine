import { connect } from "react-redux";
import { StoreState } from "../../types";
import SiteSettingsComponent from "./SiteSettingsComponent";

function mapStateToProps(state: StoreState) {
  return {
    project: state.currentProject,
  };
}

export default connect(mapStateToProps)(SiteSettingsComponent);
