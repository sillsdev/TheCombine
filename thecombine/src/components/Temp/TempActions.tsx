import { Dispatch } from "react";

export const PRESS_BUTTON = "PRESS_BUTTON";
export type PRESS_BUTTON = typeof PRESS_BUTTON;

//action types
export interface ButtonPressed {
  type: PRESS_BUTTON;
}

//action creators
export function asyncPressButton() {
  return async (dispatch: Dispatch<ButtonPressed>) => {
    //console.log("asyncPressButton called");
    dispatch(pressButton());
  };
}

//pure action creator
export function pressButton(): ButtonPressed {
  //console.log("PressButton called");
  return {
    type: PRESS_BUTTON
  };
}

export type TempAction = ButtonPressed; // | OtherAction
