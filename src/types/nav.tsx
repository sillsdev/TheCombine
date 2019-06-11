import Stack from "./stack";

export interface NavState {
  PreviousComponent: JSX.Element;
  VisibleComponent: JSX.Element;
  DisplayHistory: Stack<JSX.Element>;
  GoBack: () => void;
}
