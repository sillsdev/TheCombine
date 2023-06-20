import { Button } from "@mui/material";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Permission } from "api/models";
import ProjectButtons, {
  getIsAdminOrOwner,
  projButtonId,
  statButtonId,
} from "components/AppBar/ProjectButtons";
import { Path } from "types/path";
import { themeColors } from "types/theme";

jest.mock("backend", () => ({
  getUserRole: () => mockGetUserRole(),
}));
jest.mock("backend/localStorage", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  getProjectId: () => mockProjectId,
}));

const mockGetCurrentUser = jest.fn();
const mockGetUserRole = jest.fn();
const mockProjectId = "proj-id";
const mockProjectRoles: { [key: string]: string } = {};
mockProjectRoles[mockProjectId] = "non-empty-string";

let testRenderer: renderer.ReactTestRenderer;

const mockStore = configureMockStore()({
  currentProjectState: { project: { name: "" } },
});

const renderProjectButtons = async (path = Path.Root) => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <MemoryRouter>
          <Routes>
            <Route path="*" element={<ProjectButtons currentTab={path} />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  });
};

beforeEach(() => {
  jest.resetAllMocks();
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
      expect(await getIsAdminOrOwner()).toBeFalsy();
      mockGetCurrentUser.mockReturnValueOnce({ isAdmin: true });
      expect(await getIsAdminOrOwner()).toBeTruthy();
    });

    it("returns true for project owner but not other roles", async () => {
      mockGetCurrentUser.mockReturnValue({ projectRoles: mockProjectRoles });

      const onlyOwner = [Permission.Owner];
      mockGetUserRole.mockResolvedValueOnce({ permissions: onlyOwner });
      expect(await getIsAdminOrOwner()).toBeTruthy();

      const allButOwner = [
        Permission.DeleteEditSettingsAndUsers,
        Permission.ImportExport,
        Permission.MergeAndReviewEntries,
        Permission.WordEntry,
      ];
      mockGetUserRole.mockResolvedValueOnce({ permissions: allButOwner });
      expect(await getIsAdminOrOwner()).toBeFalsy();
    });
  });
});
