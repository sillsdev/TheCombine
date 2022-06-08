import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import ChooseProjectComponent from "components/ProjectScreen/ChooseProject";

jest.mock("react-i18next", () => ({
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...Component.defaultProps, t: (s: string) => s };
    return Component;
  },
}));

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
