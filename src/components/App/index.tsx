import React from "react";
import { StoreState } from "../../types";

import { connect } from "react-redux";
import App, { AppProps } from "./App";
import { CreateProjectState } from "../CreateProject/CreateProjectReducer";
import Navigation from "../Navigation";
import CreateProject from "../CreateProject";

export function mapStateToProps(state: StoreState): AppProps {
  return {
    VisibleComponent: renderComponent(state.createProjectState)
  };
}

// The first screen the user should see is the CreateProject component.
// After the user creates a project, the Navigation component will
// replace the CreateProject component.
function renderComponent(state: CreateProjectState): JSX.Element {
  if (state.name) {
    return <Navigation />;
  }
  return <CreateProject />;
}

export default connect(mapStateToProps)(App);
