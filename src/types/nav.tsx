// The representation of navigation state in the redux store.
export interface NavState {
  VisibleComponentId: string;
  NavBarState: NavBarState;
}

export interface NavBarState {
  Title: string;
}
