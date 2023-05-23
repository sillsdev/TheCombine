import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import configureMockStore from "redux-mock-store";

import { Path } from "browserHistory";
import "tests/reactI18nextMock";
// import { RequestState } from "components/PasswordReset/Redux/ResetReduxTypes";
import { PasswordReset } from "components/PasswordReset/ResetPage";

const mockPasswordReset = jest.fn((token: string, newPassword: string) => {
  if (token === "renderPage" || token === "resetSuccess") {
    return Promise.resolve();
  } else {
    return Promise.resolve();
  }
});

jest.mock("backend", () => ({
  resetPassword: (token: string, newPassword: string) =>
    mockPasswordReset(token, newPassword),
}));

// This test relies on nothing in the store so mock an empty store
const mockStore = configureMockStore([])({});

function renderResetPage(token: string): HTMLElement {
  const { container } = render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={[`/forgot/reset/${token}`]}>
        <Switch>
          <Route path={`${Path.PwReset}/:token`}>
            <PasswordReset />
          </Route>
        </Switch>
      </MemoryRouter>
    </Provider>
  );
  return container;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PasswordReset", () => {
  it("renders without errors", (done) => {
    const container = renderResetPage("renderPage");
    // jest.clearAllMocks();

    // // get page
    // var resetPages = testRenderer.root.findAllByType(PasswordReset);
    // expect(resetPages.length).toBe(1);
    // var resetPage = resetPages[0];

    // // set state
    // resetPage.instance.setState(
    //   {
    //     token: "",
    //     password: "password",
    //     passwordConfirm: "password",
    //     sentAttempt: false,
    //     passwordFitsRequirements: true,
    //     isPasswordConfirmed: true,
    //   },
    //   () => {
    //     // check no errors show up
    //     var lengthErrors = testRenderer.root.findAllByProps({
    //       id: "login.passwordRequirements",
    //     }).length;
    //     var confirmErrors = testRenderer.root.findAllByProps({
    //       id: "login.confirmPasswordError",
    //     }).length;
    //     var submitButton = testRenderer.root.findByProps({
    //       id: "password-reset-submit",
    //     });
    //     var resetFailErrors = testRenderer.root.findAllByProps({
    //       id: "passwordReset.resetFail",
    //     }).length;

    //     expect(resetFailErrors).toBe(0);
    //     expect(lengthErrors).toBe(0);
    //     expect(confirmErrors).toBe(0);
    //     expect(submitButton.props.disabled).toBe(false);
    //     done();
    //   }
    // );
  });

  it("renders with password length error", (done) => {
    renderResetPage("passwdLengthError");
    // jest.clearAllMocks();

    // // get page
    // var resetPages = testRenderer.root.findAllByType(PasswordReset);
    // expect(resetPages.length).toBe(1);
    // var resetPage = resetPages[0];

    // // set state
    // resetPage.instance.setState(
    //   {
    //     token: "",
    //     password: "pass",
    //     passwordConfirm: "pass",
    //     sentAttempt: false,
    //     passwordFitsRequirements: false,
    //     isPasswordConfirmed: true,
    //   },
    //   () => {
    //     // check errors show up
    //     var lengthErrors = testRenderer.root.findAllByProps({
    //       id: "login.passwordRequirements",
    //     }).length;
    //     var confirmErrors = testRenderer.root.findAllByProps({
    //       id: "login.confirmPasswordError",
    //     }).length;
    //     var submitButton = testRenderer.root.findByProps({
    //       id: "password-reset-submit",
    //     });

    //     expect(lengthErrors).toBeGreaterThan(0);
    //     expect(confirmErrors).toBe(0);
    //     expect(submitButton.props.disabled).toBe(true);
    //     done();
    //   }
    // );
  });

  it("renders with password match error", (done) => {
    renderResetPage("passwdMatchError");
    // jest.clearAllMocks();

    // // get page
    // var resetPages = testRenderer.root.findAllByType(PasswordReset);
    // expect(resetPages.length).toBe(1);
    // var resetPage = resetPages[0];

    // // set state
    // resetPage.instance.setState(
    //   {
    //     token: "",
    //     password: "password",
    //     passwordConfirm: "passward",
    //     sentAttempt: false,
    //     passwordFitsRequirements: true,
    //     isPasswordConfirmed: false,
    //   },
    //   () => {
    //     // check errors show up
    //     var lengthErrors = testRenderer.root.findAllByProps({
    //       id: "login.passwordRequirements",
    //     }).length;
    //     var confirmErrors = testRenderer.root.findAllByProps({
    //       id: "login.confirmPasswordError",
    //     }).length;
    //     var submitButton = testRenderer.root.findByProps({
    //       id: "password-reset-submit",
    //     });

    //     expect(lengthErrors).toBe(0);
    //     expect(confirmErrors).toBeGreaterThan(0);
    //     expect(submitButton.props.disabled).toBe(true);
    //     done();
    //   }
    // );
  });

  it("renders with expire error", (done) => {
    // rerender the component with the resetFailure prop set.
    // IDK a better way to update props in the test renderer
    renderResetPage("passwdResetFailure");
    // renderer.act(() => {
    //   testRenderer = renderer.create(
    //     <Provider store={mockStore}>
    //       <PasswordReset />
    //     </Provider>
    //   );
    // });

    // // get page
    // var resetPages = testRenderer.root.findAllByType(PasswordReset);
    // expect(resetPages.length).toBe(1);
    // var resetPage = resetPages[0];
    // mockStore.dispatch(resetFail());

    // // set state
    // resetPage.instance.setState(
    //   {
    //     token: "",
    //     password: "password",
    //     passwordConfirm: "password",
    //     sentAttempt: true,
    //     passwordFitsRequirements: true,
    //     isPasswordConfirmed: true,
    //   },
    //   () => {
    //     // check errors show up
    //     var resetFailErrors = testRenderer.root.findAllByProps({
    //       id: "passwordReset.resetFail",
    //     }).length;
    //     expect(resetFailErrors).toBeGreaterThan(0);
    //     done();
    //   }
    // );
  });
});
