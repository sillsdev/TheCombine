import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import ChooseProjectComponent from "components/ProjectScreen/ChooseProject";

const mockStore = configureMockStore()();

it("renders without crashing", () => {
  renderer.act(() => {
    renderer.create(
      <Provider store={mockStore}>
        <ChooseProjectComponent />
      </Provider>
    );
  });
});
