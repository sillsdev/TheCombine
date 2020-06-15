import React from "react";
import ReactDOM from "react-dom";

import VerticalDisplay from "../VerticalDisplay";
import { defaultState } from "../../DefaultState";
import { Goal } from "../../../../types/goals";

// Constants
const goals: Goal[] = [...defaultState.allPossibleGoals];
const HANDLE_CHANGE = jest.fn();
const prevCompletion: Goal[] = [...defaultState.historyState.history];
const noPrecCompletion: Goal[] = [];

describe("Tests the VerticalDisplay component", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <VerticalDisplay
        data={goals.slice(1)}
        height={100}
        numPanes={3}
        scrollToEnd={false}
        handleChange={HANDLE_CHANGE}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
