import { Button } from "@mui/material";
import renderer from "react-test-renderer";

import Logo from "components/AppBar/Logo";
import { Path } from "types/path";

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
    testRenderer = renderer.create(<Logo />);
  });
});

describe("Logo", () => {
  it("navigates to Project Screen on click", () => {
    testRenderer.root.findByType(Button).props.onClick();
    expect(mockNavigate).toBeCalledWith(Path.ProjScreen);
  });
});
