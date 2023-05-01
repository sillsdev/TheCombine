import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import PageNotFound from "components/PageNotFound/component";

const createMockStore = configureMockStore();

it("renders without crashing", () => {
  const mockStore = createMockStore();
  renderer.act(() => {
    renderer.create(
      <Provider store={mockStore}>
        <PageNotFound />
      </Provider>
    );
  });
});
