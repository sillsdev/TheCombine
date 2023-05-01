import { Provider } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import { resetFail } from "components/PasswordReset/Redux/ResetActions";
import { RequestState } from "components/PasswordReset/Redux/ResetReduxTypes";
import PasswordReset, {
  MatchParams,
} from "components/PasswordReset/ResetPage/component";

var testRenderer: renderer.ReactTestRenderer;
// This test relies on nothing in the store so mock an empty store
const mockStore = configureMockStore([])({});

const mockRouteComponentProps: RouteComponentProps<MatchParams> = {
  location: {} as any,
  history: {} as any,
  match: { params: { token: "" } } as any,
};

beforeEach(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <PasswordReset
          resetState={0}
          passwordReset={jest.fn()}
          {...mockRouteComponentProps}
        />
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
        // check no errors show up
        var lengthErrors = testRenderer.root.findAllByProps({
          id: "login.passwordRequirements",
        }).length;
        var confirmErrors = testRenderer.root.findAllByProps({
          id: "login.confirmPasswordError",
        }).length;
        var submitButton = testRenderer.root.findByProps({
          id: "password-reset-submit",
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
        // check errors show up
        var lengthErrors = testRenderer.root.findAllByProps({
          id: "login.passwordRequirements",
        }).length;
        var confirmErrors = testRenderer.root.findAllByProps({
          id: "login.confirmPasswordError",
        }).length;
        var submitButton = testRenderer.root.findByProps({
          id: "password-reset-submit",
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
        // check errors show up
        var lengthErrors = testRenderer.root.findAllByProps({
          id: "login.passwordRequirements",
        }).length;
        var confirmErrors = testRenderer.root.findAllByProps({
          id: "login.confirmPasswordError",
        }).length;
        var submitButton = testRenderer.root.findByProps({
          id: "password-reset-submit",
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
            {...mockRouteComponentProps}
          />
        </Provider>
      );
    });

    jest.clearAllMocks();

    // get page
    var resetPages = testRenderer.root.findAllByType(PasswordReset);
    expect(resetPages.length).toBe(1);
    var resetPage = resetPages[0];
    mockStore.dispatch(resetFail());

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
        // check errors show up
        var resetFailErrors = testRenderer.root.findAllByProps({
          id: "passwordReset.resetFail",
        }).length;
        expect(resetFailErrors).toBeGreaterThan(0);
        done();
      }
    );
  });
});
