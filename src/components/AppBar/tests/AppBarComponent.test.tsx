import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Path } from "browserHistory";
import { defaultState } from "components/App/DefaultState";
import AppBar from "components/AppBar/AppBarComponent";
import NavigationButtons from "components/AppBar/NavigationButtons";
import ProjectNameButton from "components/AppBar/ProjectNameButton";

const mockPath = jest.fn();
jest.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: mockPath() }),
}));

const mockStore = configureMockStore()(defaultState);

let testRenderer: ReactTestRenderer;

describe("AppBar", () => {
  it("renders without crashing", () => {
    mockPath.mockReturnValue(Path.ProjScreen);
    renderer.act(() => {
      testRenderer = renderer.create(
        <Provider store={mockStore}>
          <AppBar />
        </Provider>
      );
    });
  });
});

describe("NavigationButtons", () => {
  it("has only one tab shaded", () => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <NavigationButtons currentTab={Path.DataEntry} />
      </Provider>
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();

    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <ProjectNameButton currentTab={Path.Goals} />
      </Provider>
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});

describe("ProjectNameButton", () => {
  it("has tab shaded when itself is called", () => {
    mockPath.mockReturnValue(Path.ProjSettings);
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <ProjectNameButton currentTab={Path.ProjSettings} />
      </Provider>
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});
