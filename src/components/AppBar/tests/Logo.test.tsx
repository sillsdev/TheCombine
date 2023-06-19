import { Button } from "@mui/material";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import renderer from "react-test-renderer";

import { Path } from "browserRouter";
import Logo from "components/AppBar/Logo";

jest.mock("browserRouter", () => ({
  ...jest.requireActual("browserRouter"),
  __esModule: true,
  default: { navigate: (path: Path) => mockNavigate(path) },
}));

const mockNavigate = jest.fn();

let testRenderer: renderer.ReactTestRenderer;

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <MemoryRouter>
        <Routes>
          <Route path="*" element={<Logo />} />
        </Routes>
      </MemoryRouter>
    );
  });
});

describe("Logo", () => {
  it("navigates to Project Screen on click", () => {
    testRenderer.root.findByType(Button).props.onClick();
    expect(mockNavigate).toBeCalledWith(Path.ProjScreen);
  });
});
