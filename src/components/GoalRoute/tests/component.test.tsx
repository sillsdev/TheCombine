import "jest-canvas-mock";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import renderer from "react-test-renderer";

import { Path } from "../../../history";
import GoalRoute from "../component";

describe("GoalRoute", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <MemoryRouter initialEntries={[Path.Goals]} initialIndex={0}>
          <GoalRoute />
        </MemoryRouter>
      );
    });
  });
});
