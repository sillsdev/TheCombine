import React from "react";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import { defaultState } from "components/App/DefaultState";
import AvatarUpload from "components/UserSettings/AvatarUpload";

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

let testRenderer: ReactTestRenderer;

describe("AvatarUpload", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      testRenderer = renderer.create(
        <Provider store={mockStore}>
          <AvatarUpload />
        </Provider>
      );
    });
    expect(testRenderer.root.findAllByType(AvatarUpload).length).toBe(1);
  });
});
