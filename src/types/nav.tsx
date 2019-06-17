// The representation of navigation state in the redux store.
export interface NavState {
  VisibleComponent: JSX.Element;
  DisplayHistory: JSX.Element[];
  NavBarState: NavBarState;
}

export interface NavComponentState {
  VisibleComponent: JSX.Element;
}

export interface NavBarState {
  ShouldRenderBackButton: boolean;
}
