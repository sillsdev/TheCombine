import { Provider } from "react-redux";
import {
  ReactTestInstance,
  ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import Login, { LoginIds } from "components/Login/Login";
import { defaultState as loginState } from "components/Login/Redux/LoginReduxTypes";

jest.mock(
  "@matt-block/react-recaptcha-v2",
  () =>
    function MockRecaptcha() {
      return <div id="mockRecaptcha">Recaptcha</div>;
    }
);
jest.mock("backend", () => ({
  getBannerText: () => Promise.resolve(""),
}));
jest.mock("browserRouter");
jest.mock("components/Login/Redux/LoginActions", () => ({
  asyncLogIn: (...args: any[]) => mockAsyncLogIn(...args),
}));
jest.mock("types/hooks", () => {
  return {
    ...jest.requireActual("types/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockAsyncLogIn = jest.fn();
const mockEvent = { preventDefault: jest.fn(), target: { value: "nonempty" } };
const mockStore = configureMockStore()({ loginState });

let loginMaster: ReactTestRenderer;
let loginHandle: ReactTestInstance;

const renderLogin = async (): Promise<void> => {
  await act(async () => {
    loginMaster = create(
      <Provider store={mockStore}>
        <Login />
      </Provider>
    );
  });
  loginHandle = loginMaster.root.findByType(Login);
};

beforeEach(async () => {
  jest.clearAllMocks();
});

describe("Login", () => {
  describe("submit button", () => {
    it("errors when no username", async () => {
      await renderLogin();
      const fieldPass = loginHandle.findByProps({ id: LoginIds.FieldPassword });
      const fieldUser = loginHandle.findByProps({ id: LoginIds.FieldUsername });
      const form = loginHandle.findByProps({ id: LoginIds.Form });
      await act(async () => {
        await fieldPass.props.onChange(mockEvent);
        await form.props.onSubmit(mockEvent);
      });
      expect(fieldPass.props.error).toBeFalsy();
      expect(fieldUser.props.error).toBeTruthy();
      expect(mockAsyncLogIn).not.toBeCalled();
    });

    it("errors when no password", async () => {
      await renderLogin();
      const fieldPass = loginHandle.findByProps({ id: LoginIds.FieldPassword });
      const fieldUser = loginHandle.findByProps({ id: LoginIds.FieldUsername });
      const form = loginHandle.findByProps({ id: LoginIds.Form });
      await act(async () => {
        await fieldUser.props.onChange(mockEvent);
        await form.props.onSubmit(mockEvent);
      });
      expect(fieldPass.props.error).toBeTruthy();
      expect(fieldUser.props.error).toBeFalsy();
      expect(mockAsyncLogIn).not.toBeCalled();
    });

    it("submits when username and password", async () => {
      await renderLogin();
      const fieldPass = loginHandle.findByProps({ id: LoginIds.FieldPassword });
      const fieldUser = loginHandle.findByProps({ id: LoginIds.FieldUsername });
      const form = loginHandle.findByProps({ id: LoginIds.Form });
      await act(async () => {
        await fieldPass.props.onChange(mockEvent);
        await fieldUser.props.onChange(mockEvent);
        await form.props.onSubmit(mockEvent);
      });
      expect(fieldPass.props.error).toBeFalsy();
      expect(fieldUser.props.error).toBeFalsy();
      expect(mockAsyncLogIn).toBeCalled();
    });
  });
});
