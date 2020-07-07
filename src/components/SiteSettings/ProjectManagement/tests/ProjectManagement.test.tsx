import React from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import * as backend from "../../../../backend";
import { defaultProject, randomProject } from "../../../../types/project";
import { ProjectManagement } from "../ProjectManagement";

const projects = [randomProject(), randomProject(), randomProject()];

jest.mock("../../../backend");

const createMockStore = configureMockStore([]);

describe("Testing login component", () => {
  beforeAll(() => {
    const state = {
      currentProject: { defaultProject },
    };
    const mockStore = createMockStore(state);
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <ProjectManagement />
        </Provider>
      );
    });
  });
});
