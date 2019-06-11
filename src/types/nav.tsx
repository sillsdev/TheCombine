import Stack from "./stack";

export interface NavState {
  VisibleComponent: JSX.Element;
  DisplayHistory: Stack<JSX.Element>;
  NavBarState: NavBarState;
}

export interface NavBarState {
  ShouldRenderBackButton: boolean;
}
