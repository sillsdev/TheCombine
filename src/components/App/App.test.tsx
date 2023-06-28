import "jest-canvas-mock";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import "tests/reactI18nextMock";

import { defaultState } from "components/App/DefaultState";
import App from "components/App/component";

jest.mock("@matt-block/react-recaptcha-v2", () => () => (
  <div id="mockRecaptcha">Recaptcha</div>
));
jest.mock("components/AnnouncementBanner/AnnouncementBanner", () => "div");

const createMockStore = configureMockStore([thunk]);
const mockStore = createMockStore(defaultState);

// Need window.innerHeight defined for LandingPage.
global.innerHeight = 100;

describe("App", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <App />
        </Provider>
      );
    });
  });
});
