import React from "react";
import renderer from "react-test-renderer";

import { defaultState } from "../../DefaultState";
import VerticalDisplay from "../VerticalDisplay";

// Constants
const goals = [...defaultState.allPossibleGoals];
const HANDLE_CHANGE = jest.fn();

describe("VerticalDisplay", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <VerticalDisplay
          data={goals.slice(1)}
          height={100}
          numPanes={3}
          scrollToEnd={false}
          handleChange={HANDLE_CHANGE}
        />
      );
    });
  });
});
