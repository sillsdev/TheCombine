import "jest-canvas-mock";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { defaultState } from "components/App/DefaultState";
import App from "components/App/component";

jest.mock("@matt-block/react-recaptcha-v2", () => () => (
  <div id="mockRecaptcha">Recaptcha</div>
));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (str: string) => str }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...Component.defaultProps, t: (s: string) => s };
    return Component;
  },
}));
jest.mock("components/AnnouncementBanner/AnnouncementBanner", () => "");

const createMockStore = configureMockStore([thunk]);
const mockStore = createMockStore(defaultState);

// Need window.innerHeight defined for LandingPage.
global.innerHeight = 100;

describe("App", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </Provider>
      );
    });
  });
});
