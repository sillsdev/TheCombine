import { Button } from "@mui/material";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Permission } from "api/models";
import { Path } from "browserHistory";
import ProjectButtons, {
  getIsAdminOrOwner,
} from "components/AppBar/ProjectButtons";

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

const renderProjectButtons = async () => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <ProjectButtons currentTab={Path.Root} />
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
