import { MemoryRouter, Route, Routes } from "react-router-dom";
import renderer, { ReactTestInstance } from "react-test-renderer";

import "tests/reactI18nextMock";

import { Path } from "browserRouter";
import NavigationButtons, {
  dataCleanupButtonId,
  dataEntryButtonId,
} from "components/AppBar/NavigationButtons";
import { themeColors } from "types/theme";

let testRenderer: renderer.ReactTestRenderer;
let entryButton: ReactTestInstance | undefined;
let cleanButton: ReactTestInstance | undefined;

const renderNavButtons = (path: Path): void => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <MemoryRouter>
        <Routes>
          <Route path="*" element={<NavigationButtons currentTab={path} />} />
        </Routes>
      </MemoryRouter>
    );
  });
  entryButton = testRenderer.root.findByProps({ id: dataEntryButtonId });
  cleanButton = testRenderer.root.findByProps({ id: dataCleanupButtonId });
};

describe("NavigationButtons", () => {
  it("highlights the correct tab", () => {
    renderNavButtons(Path.Statistics);
    expect(entryButton?.props.style.background).toEqual(themeColors.lightShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.lightShade);

    renderNavButtons(Path.DataEntry);
    expect(entryButton?.props.style.background).toEqual(themeColors.darkShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.lightShade);

    renderNavButtons(Path.Goals);
    expect(entryButton?.props.style.background).toEqual(themeColors.lightShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.darkShade);

    renderNavButtons(Path.GoalCurrent);
    expect(entryButton?.props.style.background).toEqual(themeColors.lightShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.darkShade);

    renderNavButtons(Path.GoalNext);
    expect(entryButton?.props.style.background).toEqual(themeColors.lightShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.darkShade);
  });
});
