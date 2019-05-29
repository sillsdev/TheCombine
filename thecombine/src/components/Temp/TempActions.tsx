export const PRESS_BUTTON = "PRESS_BUTTON";
export type PRESS_BUTTON = typeof PRESS_BUTTON;

//action types
export interface ButtonPressed {
  type: PRESS_BUTTON;
}

//action creators
export function pressButton(): ButtonPressed {
  return {
    type: PRESS_BUTTON
  };
}

export type TempAction = ButtonPressed; // | OtherAction
