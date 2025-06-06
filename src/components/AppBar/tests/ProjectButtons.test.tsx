import { ThemeProvider } from "@mui/material/styles";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";

import { Permission } from "api/models";
import ProjectButtons, {
  projButtonId,
  statButtonId,
} from "components/AppBar/ProjectButtons";
import { defaultState as currentProjectState } from "components/Project/ProjectReduxTypes";
import { MergeDups } from "goals/MergeDuplicates/MergeDupsTypes";
import { ReviewEntries } from "goals/ReviewEntries/ReviewEntriesTypes";
import { Goal, GoalStatus } from "types/goals";
import { Path } from "types/path";
import theme, { themeColors } from "types/theme";

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("backend", () => ({
  hasPermission: (perm: Permission) => mockHasPermission(perm),
}));
jest.mock("components/Project/ProjectActions", () => ({}));

const mockHasPermission = jest.fn();
const mockProjectId = "proj-id";
const mockProjectRoles: { [key: string]: string } = {};
mockProjectRoles[mockProjectId] = "non-empty-string";

const mockStore = (goal?: Goal): MockStoreEnhanced<unknown, object> =>
  configureMockStore()({
    currentProjectState,
    goalsState: { currentGoal: goal ?? new Goal() },
  });

const renderProjectButtons = async (
  path = Path.Root,
  goal?: Goal
): Promise<void> => {
  await act(async () => {
    render(
      <ThemeProvider theme={theme}>
        <Provider store={mockStore(goal)}>
          <ProjectButtons currentTab={path} />
        </Provider>
      </ThemeProvider>
    );
  });
};

beforeEach(() => {
  jest.resetAllMocks();
  mockHasPermission.mockResolvedValue(false);
});

describe("ProjectButtons", () => {
  it("has one button by default", async () => {
    await renderProjectButtons();
    expect(screen.queryAllByRole("button")).toHaveLength(1);
  });

  it("has another button for project owner", async () => {
    mockHasPermission.mockResolvedValueOnce(true);
    await renderProjectButtons();
    expect(screen.queryAllByRole("button")).toHaveLength(2);
  });

  describe("has speaker menu only where relevant", () => {
    const testIdSpeaker = "RecordVoiceOverIcon"; // MUI Icon data-testid
    let currentGoal: Goal;

    test("Path.Root: no", async () => {
      await renderProjectButtons();
      expect(screen.queryByTestId(testIdSpeaker)).toBeNull();
    });

    test("Path.DataEntry: yes", async () => {
      await renderProjectButtons(Path.DataEntry);
      expect(screen.queryByTestId(testIdSpeaker)).toBeTruthy();
    });

    test("Path.GoalCurrent with in-progress MergeDups: no", async () => {
      currentGoal = { ...new MergeDups(), status: GoalStatus.InProgress };
      await renderProjectButtons(Path.GoalCurrent, currentGoal);
      expect(screen.queryByTestId(testIdSpeaker)).toBeNull();
    });

    test("Path.GoalCurrent with in-progress ReviewEntries: yes", async () => {
      currentGoal = { ...new ReviewEntries(), status: GoalStatus.InProgress };
      await renderProjectButtons(Path.GoalCurrent, currentGoal);
      expect(screen.queryByTestId(testIdSpeaker)).toBeTruthy();
    });

    test("Path.GoalCurrent with completed ReviewEntries: no", async () => {
      currentGoal = { ...new ReviewEntries(), status: GoalStatus.Completed };
      await renderProjectButtons(Path.GoalCurrent, currentGoal);
      expect(screen.queryByTestId(testIdSpeaker)).toBeNull();
    });
  });

  describe("has tabs shaded correctly", () => {
    const darkStyle = { background: themeColors.darkShade };
    const lightStyle = { background: themeColors.lightShade };

    beforeEach(() => {
      mockHasPermission.mockResolvedValue(true);
    });

    test("settings tab dark", async () => {
      await renderProjectButtons(Path.ProjSettings);
      expect(screen.getByTestId(projButtonId)).toHaveStyle(darkStyle);
    });

    test("settings tab light", async () => {
      await renderProjectButtons(Path.Root);
      expect(screen.getByTestId(projButtonId)).toHaveStyle(lightStyle);
    });

    test("stats tab dark", async () => {
      await renderProjectButtons(Path.Statistics);
      expect(screen.getByTestId(statButtonId)).toHaveStyle(darkStyle);
    });

    test("stats tab light", async () => {
      await renderProjectButtons(Path.Root);
      expect(screen.getByTestId(statButtonId)).toHaveStyle(lightStyle);
    });
  });
});
