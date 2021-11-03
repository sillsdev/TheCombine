import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import AvatarUpload from "components/UserSettings/AvatarUpload";

// This test relies on nothing in the store so mock an empty store
const mockStore = configureMockStore()();

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
