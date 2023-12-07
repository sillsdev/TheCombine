import { Button } from "@mui/material";
import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Permission } from "api/models";
import ProjectButtons, {
  projButtonId,
  statButtonId,
} from "components/AppBar/ProjectButtons";
import { Goal } from "types/goals";
import { Path } from "types/path";
import { themeColors } from "types/theme";

jest.mock("backend", () => ({
  hasPermission: (perm: Permission) => mockHasPermission(perm),
  isSiteAdmin: () => mockIsSiteAdmin(),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

const mockHasPermission = jest.fn();
const mockIsSiteAdmin = jest.fn();
const mockProjectId = "proj-id";
const mockProjectRoles: { [key: string]: string } = {};
mockProjectRoles[mockProjectId] = "non-empty-string";

let testRenderer: ReactTestRenderer;

const mockStore = configureMockStore()({
  currentProjectState: { project: { name: "" } },
  goalsState: { currentGoal: new Goal() },
});

const renderProjectButtons = async (path = Path.Root): Promise<void> => {
  await act(async () => {
    testRenderer = create(
      <Provider store={mockStore}>
        <ProjectButtons currentTab={path} />
      </Provider>
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

  it("has second button for admin or project owner", async () => {
    mockHasPermission.mockResolvedValueOnce(true);
    await renderProjectButtons();
    expect(testRenderer.root.findAllByType(Button)).toHaveLength(2);
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
