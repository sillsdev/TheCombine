import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { match } from "css-mediaquery";
import { Provider } from "react-redux";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";

import { Permission } from "api/models";
import { defaultState as exportProjectState } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import ProjectSettings, {
  ProjectSettingsTab,
  Setting,
} from "components/ProjectSettings";
import {
  whichSettings,
  whichTabs,
} from "components/ProjectSettings/tests/SettingsTabTypes";
import { randomProject } from "types/project";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("backend", () => ({
  canUploadLift: () => Promise.resolve(false),
  getAllSpeakers: () => Promise.resolve([]),
  getAllUsers: () => Promise.resolve([]),
  getCurrentPermissions: () => mockGetCurrentPermissions(),
  getUserRoles: () => Promise.resolve([]),
}));
jest.mock("components/Project/ProjectActions");
jest.mock("types/hooks", () => {
  return {
    ...jest.requireActual("types/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockGetCurrentPermissions = jest.fn();

const createMockStore = (hasSchedule = false): Store => {
  const project = randomProject();
  if (hasSchedule) {
    project.workshopSchedule = [new Date().toString()];
  }
  return configureMockStore()({
    currentProjectState: { project, users: [] },
    exportProjectState,
  });
};

const updateProjSettings = async (hasSchedule = false): Promise<void> => {
  await act(async () => {
    // For this update to trigger a permissions refresh, project.id must change.
    // This is accomplished by randomProject() in createMockStore().
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Provider store={createMockStore(hasSchedule)}>
          <ProjectSettings />
        </Provider>
      </LocalizationProvider>
    );
  });
};

const resetMocks = (): void => {
  jest.clearAllMocks();
  mockGetCurrentPermissions.mockResolvedValue([]);
};

// Modified from mui.com/material-ui/react-use-media-query/#testing
const createMatchMedia = (
  width: number
): ((query: string) => MediaQueryList) => {
  return (query: string) =>
    ({
      matches: match(query, { width }),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }) as any;
};

beforeAll(async () => {
  // Required for the <Hidden> elements to show up
  window.matchMedia = createMatchMedia(window.innerWidth);

  resetMocks();
  await act(async () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Provider store={createMockStore()}>
          <ProjectSettings />
        </Provider>
      </LocalizationProvider>
    );
  });
});

beforeEach(() => {
  resetMocks();
});

afterEach(cleanup);

const isPanelVisible = (tab: ProjectSettingsTab): void => {
  const panels = screen.queryAllByRole("tabpanel");
  expect(panels).toHaveLength(1);
  expect(panels[0].id.includes(tab.toString()));
};

describe("ProjectSettings", () => {
  test("languages tab available and enabled by default", async () => {
    isPanelVisible(ProjectSettingsTab.Languages);
    screen.getByTestId(Setting.Languages);
  });

  test("enable the correct panel when tab is clicked", async () => {
    const agent = userEvent.setup();
    mockGetCurrentPermissions.mockResolvedValue(Object.values(Permission));
    await updateProjSettings();
    const tabs = Object.values(ProjectSettingsTab);
    expect(screen.queryAllByRole("tab")).toHaveLength(tabs.length);
    for (const tab of tabs) {
      await agent.click(screen.getByTestId(tab));
      isPanelVisible(tab);
    }
  });

  describe("correct settings in each tab for each permission (w/o schedule)", () => {
    const hasSchedule = false;
    for (const perm of Object.values(Permission)) {
      test(`permission ${perm}`, async () => {
        const agent = userEvent.setup();
        mockGetCurrentPermissions.mockResolvedValue([perm]);
        await updateProjSettings(hasSchedule);
        const tabs = whichTabs(perm, hasSchedule);
        expect(screen.queryAllByRole("tab")).toHaveLength(tabs.length);
        for (const tab of tabs) {
          await agent.click(screen.getByTestId(tab));
          whichSettings(perm, hasSchedule, tab).forEach((s) =>
            screen.getByTestId(s)
          );
        }
      });
    }
  });

  describe("correct settings in each tab for each permission (w/ schedule)", () => {
    const hasSchedule = true;
    for (const perm of Object.values(Permission)) {
      test(`permission ${perm}`, async () => {
        const agent = userEvent.setup();
        mockGetCurrentPermissions.mockResolvedValue([perm]);
        await updateProjSettings(hasSchedule);
        const tabs = whichTabs(perm, hasSchedule);
        expect(screen.queryAllByRole("tab")).toHaveLength(tabs.length);
        for (const tab of tabs) {
          await agent.click(screen.getByTestId(tab));
          whichSettings(perm, hasSchedule, tab).forEach((s) =>
            screen.getByTestId(s)
          );
        }
      });
    }
  });
});
