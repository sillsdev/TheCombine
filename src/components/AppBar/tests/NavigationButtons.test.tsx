import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer, { type ReactTestInstance } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Permission } from "api/models";
import NavigationButtons, {
  dataCleanupButtonId,
  dataEntryButtonId,
} from "components/AppBar/NavigationButtons";
import { Path } from "types/path";
import theme, { themeColors } from "types/theme";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("backend", () => ({
  getCurrentPermissions: () => mockGetCurrentPermissions(),
}));

const mockGetCurrentPermissions = jest.fn();
const mockStore = configureMockStore()({
  currentProjectState: { project: { id: "" } },
});

let testRenderer: renderer.ReactTestRenderer;
let entryButton: ReactTestInstance;
let cleanButton: ReactTestInstance | null;

const renderNavButtons = async (
  path: Path,
  permission = Permission.MergeAndReviewEntries
): Promise<void> => {
  mockGetCurrentPermissions.mockResolvedValue([permission]);
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <ThemeProvider theme={theme}>
        <Provider store={mockStore}>
          <NavigationButtons currentTab={path} />
        </Provider>
      </ThemeProvider>
    );
  });
};

const renderNavButtonsWithPath = async (path: Path): Promise<void> => {
  await renderNavButtons(path, Permission.MergeAndReviewEntries);
  entryButton = testRenderer.root.findByProps({ id: dataEntryButtonId });
  cleanButton = testRenderer.root.findByProps({ id: dataCleanupButtonId });
};

const renderNavButtonsWithPermission = async (
  perm: Permission
): Promise<void> => {
  await renderNavButtons(Path.DataEntry, perm);
  entryButton = testRenderer.root.findByProps({ id: dataEntryButtonId });
  const cleanupButtons = testRenderer.root.findAllByProps({
    id: dataCleanupButtonId,
  });
  cleanButton = cleanupButtons.length ? cleanupButtons[0] : null;
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("NavigationButtons", () => {
  it("only shows the data cleanup tab for the correct permissions", async () => {
    for (const perm of Object.values(Permission)) {
      await renderNavButtonsWithPermission(perm);
      if (
        perm === Permission.CharacterInventory ||
        perm === Permission.MergeAndReviewEntries
      ) {
        expect(cleanButton).toBeTruthy();
      } else {
        expect(cleanButton).toBeNull();
      }
    }
  });

  it("highlights the correct tab", async () => {
    await renderNavButtonsWithPath(Path.DataEntry);
    expect(entryButton?.props.style.background).toEqual(themeColors.darkShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.lightShade);

    await renderNavButtonsWithPath(Path.Goals);
    expect(entryButton?.props.style.background).toEqual(themeColors.lightShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.darkShade);

    await renderNavButtonsWithPath(Path.GoalCurrent);
    expect(entryButton?.props.style.background).toEqual(themeColors.lightShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.darkShade);

    await renderNavButtonsWithPath(Path.GoalNext);
    expect(entryButton?.props.style.background).toEqual(themeColors.lightShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.darkShade);

    await renderNavButtonsWithPath(Path.ProjSettings);
    expect(entryButton?.props.style.background).toEqual(themeColors.lightShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.lightShade);

    await renderNavButtonsWithPath(Path.Statistics);
    expect(entryButton?.props.style.background).toEqual(themeColors.lightShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.lightShade);

    await renderNavButtonsWithPath(Path.UserSettings);
    expect(entryButton?.props.style.background).toEqual(themeColors.lightShade);
    expect(cleanButton?.props.style.background).toEqual(themeColors.lightShade);
  });
});
