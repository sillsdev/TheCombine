// The representation of navigation state in the redux store.
export interface NavState {
  VisibleComponentId: string;
  DisplayHistory: string[];
  NavBarState: NavBarState;
}

export interface NavBarState {
  ShouldRenderBackButton: boolean;
}
