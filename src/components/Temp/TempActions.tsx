import { Dispatch } from "react";
import axios from "axios";

export const PRESS_BUTTON = "PRESS_BUTTON";
export type PRESS_BUTTON = typeof PRESS_BUTTON;

//action types
export interface ButtonPressed {
  type: PRESS_BUTTON;
}

var server = axios.create({
  baseURL: "https://localhost:5001/v1/Project",
  timeout: 1000,
  headers: { "Content-Type": "application/json" }
});

//thunk action creator
export function asyncPressButton() {
  return async (dispatch: Dispatch<ButtonPressed>) => {
    //console.log('asyncPressButton called');
    dispatch(pressButton());
    await server
      .post("/words", {
        Vernacular: "test",
        Gloss: "test2",
        Audio: "sound",
        Timestamp: "now"
      })
      .then(function(response) {
        console.log(response);
      });
  };
}

//pure action creator. LEAVE PURE!
export function pressButton(): ButtonPressed {
  //console.log('PressButton called');
  return {
    type: PRESS_BUTTON
  };
}

export type TempAction = ButtonPressed; // | OtherAction
