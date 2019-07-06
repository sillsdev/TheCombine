import React from "react";
import ReactDOM from "react-dom";

import HorizontalDisplay from "../HorizontalDisplay";
import { defaultState } from "../../DefaultState";
import { Goal } from "../../../../types/goals";

// Constants
const goals: Goal[] = [...defaultState.allPossibleGoals];
const HANDLE_CHANGE = jest.fn();

describe("Tests the HorizontalDisplay component", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <HorizontalDisplay
        data={goals.slice(1)}
        width={100}
        numPanes={3}
        scrollToEnd={false}
        handleChange={HANDLE_CHANGE}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
