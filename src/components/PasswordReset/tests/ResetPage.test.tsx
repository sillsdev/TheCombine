import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import configureMockStore from "redux-mock-store";

import { Path } from "browserHistory";
import "tests/reactI18nextMock";
// import { RequestState } from "components/PasswordReset/Redux/ResetReduxTypes";
import { defaultState } from "components/PasswordReset/Redux/ResetReducer";
import {
  PasswordReset,
  PasswordResetTestIds,
} from "components/PasswordReset/ResetPage";

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
const mockStore = configureMockStore([])({ defaultState });
const user = userEvent.setup();

afterEach(cleanup);

function renderResetPage(token: string) {
  act(() => {
    render(
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
  });
}

describe("PasswordReset", () => {
  it("renders without errors", (done) => {
    jest.clearAllMocks();
    renderResetPage("renderPage");

    // check that only password length error shows up
    const lengthErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordReqError
    ).length;
    const confirmErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordMatchError
    ).length;
    const submitButton = screen.getByTestId(PasswordResetTestIds.SubmitButton);
    const resetFailErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordResetFail
    ).length;

    expect(resetFailErrors).toBe(0);
    // We expect a length error since the password field is empty when the
    // screen is first displayed.
    expect(lengthErrors).toBe(1);
    expect(confirmErrors).toBe(0);
    expect(submitButton.closest("button")).toBeDisabled();
    done();
    //   }
    // );
  });

  it("renders with password length error", async () => {
    jest.clearAllMocks();
    renderResetPage("renderPage");

    const shortPassword = "foo";
    const passwdField = screen.getByTestId(PasswordResetTestIds.Password);
    await user.type(passwdField, shortPassword);
    const passwdConfirm = screen.getByTestId(
      PasswordResetTestIds.ConfirmPassword
    );
    await user.type(passwdConfirm, shortPassword);

    const reqErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordReqError
    );
    const confirmErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordMatchError
    ).length;
    const submitButton = screen.getByTestId(PasswordResetTestIds.SubmitButton);

    expect(reqErrors.length).toBeGreaterThan(0);
    expect(confirmErrors).toBe(0);
    expect(submitButton.closest("button")).toBeDisabled();
  });

  it("renders with password match error", async () => {
    jest.clearAllMocks();
    renderResetPage("renderPage");

    const passwordEntry = "password";
    const confirmEntry = "passward";
    const passwdField = screen.getByTestId(PasswordResetTestIds.Password);
    await user.type(passwdField, passwordEntry);
    const passwdConfirm = screen.getByTestId(
      PasswordResetTestIds.ConfirmPassword
    );
    await user.type(passwdConfirm, confirmEntry);

    const reqErrors: HTMLElement[] = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordReqError
    );
    const confirmErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordMatchError
    );
    const submitButton = screen.getByTestId(PasswordResetTestIds.SubmitButton);

    if (reqErrors.length > 0) {
      console.log(
        `Tag: ${reqErrors[0].tagName}\nhidden: ${reqErrors[0].hidden}\nInner Text: ${reqErrors[0].innerText}`
      );
    }

    expect(reqErrors.length).toBe(0);
    expect(confirmErrors.length).toBeGreaterThan(0);
    expect(submitButton.closest("button")).toBeDisabled();
  });

  // it("renders with expire error", (done) => {
  // rerender the component with the resetFailure prop set.
  // IDK a better way to update props in the test renderer
  // renderResetPage("passwdResetFailure");
  // renderer.act(() => {
  //   testRenderer = renderer.create(
  //     <Provider store={mockStore}>
  //       <PasswordReset />
  //     </Provider>
  //   );
  // });

  // // get page
  // var resetPages = container.getAllByType(PasswordReset);
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
  //     var resetFailErrors = container.getAllByProps({
  //       id: "passwordReset.resetFail",
  //     }).length;
  //     expect(resetFailErrors).toBeGreaterThan(0);
  //     done();
  //   }
  // );
  // });
});
