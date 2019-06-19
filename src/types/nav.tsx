// The representation of navigation state in the redux store.
export interface NavState {
  VisibleComponentId: number;
  DisplayHistory: number[];
  NavBarState: NavBarState;
}

export interface NavBarState {
  ShouldRenderBackButton: boolean;
}
