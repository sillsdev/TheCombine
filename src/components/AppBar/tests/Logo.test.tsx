import { ThemeProvider } from "@mui/material/styles";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Logo, { logoButtonLabel } from "components/AppBar/Logo";
import { Path } from "types/path";
import theme from "types/theme";

jest.mock("react-router", () => ({
  useNavigate:
    () =>
    (...args: any) =>
      mockNavigate(...args),
}));

const mockNavigate = jest.fn();

beforeAll(async () => {
  await act(async () => {
    render(
      <ThemeProvider theme={theme}>
        <Logo />
      </ThemeProvider>
    );
  });
});

describe("Logo", () => {
  it("navigates to Project Screen on click", async () => {
    const agent = userEvent.setup();
    await agent.click(screen.getByLabelText(logoButtonLabel));
    expect(mockNavigate).toHaveBeenCalledWith(Path.ProjScreen);
  });
});
