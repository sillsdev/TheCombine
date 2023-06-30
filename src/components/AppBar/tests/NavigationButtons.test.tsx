import renderer, { ReactTestInstance } from "react-test-renderer";

import "tests/reactI18nextMock";

import NavigationButtons, {
  dataCleanupButtonId,
  dataEntryButtonId,
} from "components/AppBar/NavigationButtons";
import { Path } from "types/path";
import { themeColors } from "types/theme";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

let testRenderer: renderer.ReactTestRenderer;
let entryButton: ReactTestInstance | undefined;
let cleanButton: ReactTestInstance | undefined;

const renderNavButtons = (path: Path): void => {
  renderer.act(() => {
    testRenderer = renderer.create(<NavigationButtons currentTab={path} />);
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
