import { Button } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";

import { Permission } from "api/models";
import ProjectButtons, {
  projButtonId,
  statButtonId,
} from "components/AppBar/ProjectButtons";
import SpeakerMenu from "components/AppBar/SpeakerMenu";
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
  isSiteAdmin: () => mockIsSiteAdmin(),
}));
jest.mock("components/Project/ProjectActions", () => ({}));

const mockHasPermission = jest.fn();
const mockIsSiteAdmin = jest.fn();
const mockProjectId = "proj-id";
const mockProjectRoles: { [key: string]: string } = {};
mockProjectRoles[mockProjectId] = "non-empty-string";

let testRenderer: ReactTestRenderer;

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
    testRenderer = create(
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
    expect(testRenderer.root.findAllByType(Button)).toHaveLength(1);
  });

  it("has another button for admin or project owner", async () => {
    mockHasPermission.mockResolvedValueOnce(true);
    await renderProjectButtons();
    expect(testRenderer.root.findAllByType(Button)).toHaveLength(2);
  });

  it("has speaker menu only when in Data Entry or Review Entries", async () => {
    await renderProjectButtons();
    expect(testRenderer.root.findAllByType(SpeakerMenu)).toHaveLength(0);

    await renderProjectButtons(Path.DataEntry);
    expect(testRenderer.root.findAllByType(SpeakerMenu)).toHaveLength(1);

    let currentGoal: Goal;
    currentGoal = { ...new MergeDups(), status: GoalStatus.InProgress };
    await renderProjectButtons(Path.GoalCurrent, currentGoal);
    expect(testRenderer.root.findAllByType(SpeakerMenu)).toHaveLength(0);

    currentGoal = { ...new ReviewEntries(), status: GoalStatus.Completed };
    await renderProjectButtons(Path.GoalCurrent, currentGoal);
    expect(testRenderer.root.findAllByType(SpeakerMenu)).toHaveLength(0);

    currentGoal = { ...new ReviewEntries(), status: GoalStatus.InProgress };
    await renderProjectButtons(Path.GoalCurrent, currentGoal);
    expect(testRenderer.root.findAllByType(SpeakerMenu)).toHaveLength(1);
  });

  it("has settings tab shaded correctly", async () => {
    await renderProjectButtons();
    let button = testRenderer.root.findByProps({ id: projButtonId });
    expect(button.props.style.background).toEqual(themeColors.lightShade);

    await renderProjectButtons(Path.ProjSettings);
    button = testRenderer.root.findByProps({ id: projButtonId });
    expect(button.props.style.background).toEqual(themeColors.darkShade);
  });

  it("has stats tab shaded correctly", async () => {
    mockHasPermission.mockResolvedValue(true);
    await renderProjectButtons();
    let button = testRenderer.root.findByProps({ id: statButtonId });
    expect(button.props.style.background).toEqual(themeColors.lightShade);

    await renderProjectButtons(Path.Statistics);
    button = testRenderer.root.findByProps({ id: statButtonId });
    expect(button.props.style.background).toEqual(themeColors.darkShade);
  });
});
