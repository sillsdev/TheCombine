import { ThemeProvider } from "@mui/material/styles";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { Permission } from "api/models";
import NavigationButtons, {
  dataCleanupButtonId,
  dataEntryButtonId,
} from "components/AppBar/NavigationButtons";
import { Path } from "types/path";
import theme, { themeColors } from "types/theme";

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("backend", () => ({
  getCurrentPermissions: () => mockGetCurrentPermissions(),
}));

const mockGetCurrentPermissions = jest.fn();
const mockStore = configureMockStore()({
  currentProjectState: { project: { id: "" } },
});

const renderNavButtons = async (
  path: Path,
  permission = Permission.MergeAndReviewEntries
): Promise<void> => {
  mockGetCurrentPermissions.mockResolvedValue([permission]);
  await act(async () => {
    render(
      <ThemeProvider theme={theme}>
        <Provider store={mockStore}>
          <NavigationButtons currentTab={path} />
        </Provider>
      </ThemeProvider>
    );
  });
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("NavigationButtons", () => {
  describe("only shows data cleanup tab for the correct permissions", () => {
    const renderNavButtonsWithPermission = async (
      perm: Permission
    ): Promise<void> => {
      await renderNavButtons(Path.DataEntry, perm);
    };

    for (const perm of Object.values(Permission)) {
      test(perm, async () => {
        await renderNavButtonsWithPermission(perm);
        if (
          perm === Permission.CharacterInventory ||
          perm === Permission.MergeAndReviewEntries
        ) {
          expect(screen.queryByTestId(dataCleanupButtonId)).toBeTruthy();
        } else {
          expect(screen.queryByTestId(dataCleanupButtonId)).toBeNull();
        }
      });
    }
  });

  describe("highlights the correct tab for each path", () => {
    const renderNavButtonsWithPath = async (path: Path): Promise<void> => {
      await renderNavButtons(path, Permission.MergeAndReviewEntries);
    };

    const darkStyle = { background: themeColors.darkShade };
    const lightStyle = { background: themeColors.lightShade };

    test("Path.DataEntry", async () => {
      await renderNavButtonsWithPath(Path.DataEntry);
      expect(screen.getByTestId(dataEntryButtonId)).toHaveStyle(darkStyle);
      expect(screen.getByTestId(dataCleanupButtonId)).toHaveStyle(lightStyle);
    });

    test("Path.Goals", async () => {
      await renderNavButtonsWithPath(Path.Goals);
      expect(screen.getByTestId(dataEntryButtonId)).toHaveStyle(lightStyle);
      expect(screen.getByTestId(dataCleanupButtonId)).toHaveStyle(darkStyle);
    });

    test("Path.GoalCurrent", async () => {
      await renderNavButtonsWithPath(Path.GoalCurrent);
      expect(screen.getByTestId(dataEntryButtonId)).toHaveStyle(lightStyle);
      expect(screen.getByTestId(dataCleanupButtonId)).toHaveStyle(darkStyle);
    });

    test("Path.GoalNext", async () => {
      await renderNavButtonsWithPath(Path.GoalNext);
      expect(screen.getByTestId(dataEntryButtonId)).toHaveStyle(lightStyle);
      expect(screen.getByTestId(dataCleanupButtonId)).toHaveStyle(darkStyle);
    });

    test("Path.ProjSettings", async () => {
      await renderNavButtonsWithPath(Path.ProjSettings);
      expect(screen.getByTestId(dataEntryButtonId)).toHaveStyle(lightStyle);
      expect(screen.getByTestId(dataCleanupButtonId)).toHaveStyle(lightStyle);
    });

    test("Path.Statistics", async () => {
      await renderNavButtonsWithPath(Path.Statistics);
      expect(screen.getByTestId(dataEntryButtonId)).toHaveStyle(lightStyle);
      expect(screen.getByTestId(dataCleanupButtonId)).toHaveStyle(lightStyle);
    });

    test("Path.UserSettings", async () => {
      await renderNavButtonsWithPath(Path.UserSettings);
      expect(screen.getByTestId(dataEntryButtonId)).toHaveStyle(lightStyle);
      expect(screen.getByTestId(dataCleanupButtonId)).toHaveStyle(lightStyle);
    });
  });
});
