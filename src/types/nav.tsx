import Stack from "./stack";

// The representation of navigation state in the redux store.
export interface NavState {
  VisibleComponent: JSX.Element;
  DisplayHistory: Stack<JSX.Element>;
  NavBarState: NavBarState;
}

export interface NavComponentState {
  VisibleComponent: JSX.Element;
}

export interface NavBarState {
  ShouldRenderBackButton: boolean;
}
