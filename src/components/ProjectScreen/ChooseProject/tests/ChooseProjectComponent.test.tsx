import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Project } from "types/project";
import ChooseProjectComponent from "components/ProjectScreen/ChooseProject";

const createMockStore = configureMockStore([]);
const mockStore = createMockStore({} as Project);

it("renders without crashing", () => {
  renderer.act(() => {
    renderer.create(
      <Provider store={mockStore}>
        <ChooseProjectComponent />
      </Provider>
    );
  });
});
