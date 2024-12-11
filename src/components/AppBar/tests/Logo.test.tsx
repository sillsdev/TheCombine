import { Button } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import renderer from "react-test-renderer";

import Logo from "components/AppBar/Logo";
import { Path } from "types/path";
import theme from "types/theme";

jest.mock("react-router-dom", () => ({
  useNavigate:
    () =>
    (...args: any) =>
      mockNavigate(...args),
}));

const mockNavigate = jest.fn();

let testRenderer: renderer.ReactTestRenderer;

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <ThemeProvider theme={theme}>
        <Logo />
      </ThemeProvider>
    );
  });
});

describe("Logo", () => {
  it("navigates to Project Screen on click", () => {
    testRenderer.root.findByType(Button).props.onClick();
    expect(mockNavigate).toHaveBeenCalledWith(Path.ProjScreen);
  });
});
