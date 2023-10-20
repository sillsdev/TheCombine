import { Button } from "@mui/material";
import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Permission } from "api/models";
import ProjectButtons, {
  getHasStatsPermission,
  projButtonId,
  statButtonId,
} from "components/AppBar/ProjectButtons";
import { Path } from "types/path";
import { themeColors } from "types/theme";

jest.mock("backend", () => ({
  getCurrentPermissions: () => mockGetCurrentPermissions(),
}));
jest.mock("backend/localStorage", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

const mockGetCurrentPermissions = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockProjectId = "proj-id";
const mockProjectRoles: { [key: string]: string } = {};
mockProjectRoles[mockProjectId] = "non-empty-string";

let testRenderer: ReactTestRenderer;

const mockStore = configureMockStore()({
  currentProjectState: { project: { name: "" } },
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
  mockGetCurrentPermissions.mockResolvedValue([]);
});

describe("ProjectButtons", () => {
  it("has one button by default", async () => {
    await renderProjectButtons();
    expect(testRenderer.root.findAllByType(Button)).toHaveLength(1);
  });

  it("has second button for admin or project owner", async () => {
    mockGetCurrentUser.mockReturnValueOnce({ isAdmin: true });
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
    mockGetCurrentUser.mockReturnValue({ isAdmin: true });
    await renderProjectButtons();
    let button = testRenderer.root.findByProps({ id: statButtonId });
    expect(button.props.style.background).toEqual(themeColors.lightShade);

    await renderProjectButtons(Path.Statistics);
    button = testRenderer.root.findByProps({ id: statButtonId });
    expect(button.props.style.background).toEqual(themeColors.darkShade);
  });

  describe("getIsAdminOrOwner", () => {
    it("returns true for admin users", async () => {
      expect(await getHasStatsPermission()).toBeFalsy();
      mockGetCurrentUser.mockReturnValueOnce({ isAdmin: true });
      expect(await getHasStatsPermission()).toBeTruthy();
    });

    it("returns true only for those with the statistics permission", async () => {
      const onlyStats = [Permission.Statistics];
      mockGetCurrentPermissions.mockResolvedValueOnce(onlyStats);
      expect(await getHasStatsPermission()).toBeTruthy();

      const allButStats = [
        Permission.Archive,
        Permission.CharacterInventory,
        Permission.DeleteEditSettingsAndUsers,
        Permission.Export,
        Permission.Import,
        Permission.MergeAndReviewEntries,
        Permission.WordEntry,
      ];
      mockGetCurrentPermissions.mockResolvedValueOnce(allButStats);
      expect(await getHasStatsPermission()).toBeFalsy();
    });
  });
});
