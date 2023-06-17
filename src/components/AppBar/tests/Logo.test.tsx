import { Button } from "@mui/material";
import renderer from "react-test-renderer";

import { Path } from "browserRouter";
import Logo from "components/AppBar/Logo";

jest.mock("browserHistory", () => ({
  ...jest.requireActual("browserHistory"),
  __esModule: true,
  default: { push: (path: Path) => mockPush(path) },
}));

const mockPush = jest.fn();

let testRenderer: renderer.ReactTestRenderer;

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(<Logo />);
  });
});

describe("Logo", () => {
  it("navigates to Project Screen on click", () => {
    testRenderer.root.findByType(Button).props.onClick();
    expect(mockPush).toBeCalledWith(Path.ProjScreen);
  });
});
