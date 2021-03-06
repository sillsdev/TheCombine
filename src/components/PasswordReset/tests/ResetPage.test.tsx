import React from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import PasswordReset from "components/PasswordReset/ResetPage/component";
import * as ResetActions from "components/PasswordReset/actions";
import { RequestState } from "components/PasswordReset/reducer";

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

beforeEach(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <PasswordReset resetState={0} passwordReset={jest.fn()} />
      </Provider>
    );
  });
});

describe("PasswordReset", () => {
  it("renders without errors", (done) => {
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
        passwordFitsRequirements: true,
        isPasswordConfirmed: true,
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

  it("renders with length error", (done) => {
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
        passwordFitsRequirements: false,
        isPasswordConfirmed: true,
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

  it("renders with password match error", (done) => {
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
        passwordFitsRequirements: true,
        isPasswordConfirmed: false,
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

  it("renders with expire error", (done) => {
    // rerender the component with the resetFailure prop set.
    // IDK a better way to update props in the test renderer
    renderer.act(() => {
      testRenderer = renderer.create(
        <Provider store={mockStore}>
          <PasswordReset
            resetState={RequestState.Fail}
            passwordReset={jest.fn()}
          />
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
        passwordFitsRequirements: true,
        isPasswordConfirmed: true,
      },
      () => {
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
