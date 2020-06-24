import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
} from "react-test-renderer";
import { defaultState } from "../../App/DefaultState";
import PasswordReset from "../ResetPage/component";
import * as ResetActions from "../actions";

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

beforeEach(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <PasswordReset />
      </Provider>
    );
  });
});

describe("Test ResetPage", () => {
  it("should render without errors", (done) => {
    jest.clearAllMocks();

    // get page
    var resetPages = testRenderer.root.findAllByType(PasswordReset);
    expect(resetPages.length).toBe(1);
    var resetPage = resetPages[0];

    // set state
    resetPage.instance.setState(
      {
        token: "",
        password: "password",
        passwordConfirm: "password",
        sentAttempt: false,
        passwordLength: false,
        passwordSame: false,
        resetFailure: false,
      },
      () => {
        // check no errors showup
        var lengthErrors = testRenderer.root.findAllByProps({
          id: "login.passwordRequirements",
        }).length;
        var confirmErrors = testRenderer.root.findAllByProps({
          id: "login.confirmPasswordError",
        }).length;
        var submitButton = testRenderer.root.findByProps({
          id: "submit_button",
        });
        var resetFailErrors = testRenderer.root.findAllByProps({
          id: "passwordReset.resetFail",
        }).length;

        expect(resetFailErrors).toBe(0);
        expect(lengthErrors).toBe(0);
        expect(confirmErrors).toBe(0);
        expect(submitButton.props.disabled).toBe(false);
        done();
      }
    );
  });

  it("should render with length error", (done) => {
    jest.clearAllMocks();

    // get page
    var resetPages = testRenderer.root.findAllByType(PasswordReset);
    expect(resetPages.length).toBe(1);
    var resetPage = resetPages[0];

    // set state
    resetPage.instance.setState(
      {
        token: "",
        password: "pass",
        passwordConfirm: "pass",
        sentAttempt: false,
        passwordLength: true,
        passwordSame: false,
      },
      () => {
        // check errors showup
        var lengthErrors = testRenderer.root.findAllByProps({
          id: "login.passwordRequirements",
        }).length;
        var confirmErrors = testRenderer.root.findAllByProps({
          id: "login.confirmPasswordError",
        }).length;
        var submitButton = testRenderer.root.findByProps({
          id: "submit_button",
        });

        expect(lengthErrors).toBeGreaterThan(0);
        expect(confirmErrors).toBe(0);
        expect(submitButton.props.disabled).toBe(true);
        done();
      }
    );
  });

  it("should render with password match error", (done) => {
    jest.clearAllMocks();

    // get page
    var resetPages = testRenderer.root.findAllByType(PasswordReset);
    expect(resetPages.length).toBe(1);
    var resetPage = resetPages[0];

    // set state
    resetPage.instance.setState(
      {
        token: "",
        password: "password",
        passwordConfirm: "passward",
        sentAttempt: false,
        passwordLength: false,
        passwordSame: true,
      },
      () => {
        // check errors showup
        var lengthErrors = testRenderer.root.findAllByProps({
          id: "login.passwordRequirements",
        }).length;
        var confirmErrors = testRenderer.root.findAllByProps({
          id: "login.confirmPasswordError",
        }).length;
        var submitButton = testRenderer.root.findByProps({
          id: "submit_button",
        });

        expect(lengthErrors).toBe(0);
        expect(confirmErrors).toBeGreaterThan(0);
        expect(submitButton.props.disabled).toBe(true);
        done();
      }
    );
  });

  it("should render with expire error", (done) => {
    // rerender the component with the resetFailure prop set.
    // IDK a better way to update props in the test renderer
    renderer.act(() => {
      testRenderer = renderer.create(
        <Provider store={mockStore}>
          <PasswordReset resetFailure={true} />
        </Provider>
      );
    });

    jest.clearAllMocks();

    // get page
    var resetPages = testRenderer.root.findAllByType(PasswordReset);
    expect(resetPages.length).toBe(1);
    var resetPage = resetPages[0];
    mockStore.dispatch(ResetActions.resetFail());

    // set state
    resetPage.instance.setState(
      {
        token: "",
        password: "password",
        passwordConfirm: "password",
        sentAttempt: true,
        passwordLength: false,
        passwordSame: false,
      },
      () => {
        var resetPage = testRenderer.root.findAllByType(PasswordReset)[0];
        console.log(resetPage.props);
        // check errors showup
        var resetFailErrors = testRenderer.root.findAllByProps({
          id: "passwordReset.resetFail",
        }).length;
        expect(resetFailErrors).toBeGreaterThan(0);
        done();
      }
    );
  });
});
