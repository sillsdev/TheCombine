import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import ProjectSettings, {
  ProjectSettingsTab,
} from "components/ProjectSettings";
import { randomProject } from "types/project";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("backend", () => ({
  canUploadLift: () => Promise.resolve(false),
  getCurrentPermissions: () => mockGetCurrentPermissions(),
}));
jest.mock("components/Project/ProjectActions");
jest.mock("components/ProjectExport/ExportButton", () => "div");
jest.mock("components/ProjectSettings/ProjectImport", () => "div");
jest.mock("components/ProjectUsers/ActiveProjectUsers", () => "div");
jest.mock("components/ProjectUsers/AddProjectUsers", () => "div");
jest.mock("types/hooks", () => {
  return {
    ...jest.requireActual("types/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockGetCurrentPermissions = jest.fn();

const createMockStore = () =>
  configureMockStore()({
    currentProjectState: { project: randomProject() },
  });

const updateProjSettings = async () => {
  await act(async () => {
    // For this update to trigger a permissions refresh, project.id must change.
    // This is accomplished by randomProject() in createMockStore().
    render(
      <Provider store={createMockStore()}>
        <ProjectSettings />
      </Provider>
    );
  });
};

const resetMocks = () => {
  jest.clearAllMocks();
  mockGetCurrentPermissions.mockResolvedValue([]);
};

beforeAll(async () => {
  resetMocks();
  await act(async () => {
    render(
      <Provider store={createMockStore()}>
        <ProjectSettings />
      </Provider>
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
  it("renders with the languages tab panel enabled", async () => {
    //expect(screen.queryAllByRole("tab")).toHaveLength(5);
    isPanelVisible(ProjectSettingsTab.Languages);
  });

  /*test("with no permissions", async () => {
    await updateProjSettings();
    for (const component of withNoPerm) {
      expect(projSettingsInstance.findByType(component)).toBeTruthy();
    }
    expect(projSettingsInstance.findAllByType(BaseSettings)).toHaveLength(
      withNoPerm.length
    );

    expect(
      projSettingsInstance.findByType(ProjectLanguages).props.readOnly
    ).toBeTruthy();
    expect(
      projSettingsInstance.findByType(ProjectSchedule).props.readOnly
    ).toBeTruthy();
  });

  test("with Permission.Archive", async () => {
    mockGetCurrentPermissions.mockResolvedValue([Permission.Archive]);
    await updateProjSettings();
    for (const component of withArchivePerm) {
      expect(projSettingsInstance.findByType(component)).toBeTruthy();
    }
    expect(projSettingsInstance.findAllByType(BaseSettings)).toHaveLength(
      withNoPerm.length + withArchivePerm.length
    );
  });

  test("with Permission.DeleteEditSettingsAndUsers", async () => {
    mockGetCurrentPermissions.mockResolvedValue([
      Permission.DeleteEditSettingsAndUsers,
    ]);
    await updateProjSettings();
    for (const component of withDeleteEditPerm) {
      expect(projSettingsInstance.findByType(component)).toBeTruthy();
    }
    expect(projSettingsInstance.findAllByType(BaseSettings)).toHaveLength(
      withNoPerm.length + withDeleteEditPerm.length
    );

    expect(
      projSettingsInstance.findByType(ProjectLanguages).props.readOnly
    ).toBeFalsy();
  });

  test("with Permission.Export", async () => {
    mockGetCurrentPermissions.mockResolvedValue([Permission.Export]);
    await updateProjSettings();
    for (const component of withExportPerm) {
      expect(projSettingsInstance.findByType(component)).toBeTruthy();
    }
    expect(projSettingsInstance.findAllByType(BaseSettings)).toHaveLength(
      withNoPerm.length + withExportPerm.length
    );
  });

  test("with Permission.Import", async () => {
    mockGetCurrentPermissions.mockResolvedValue([Permission.Import]);
    await updateProjSettings();
    for (const component of withImportPerm) {
      expect(projSettingsInstance.findByType(component)).toBeTruthy();
    }
    expect(projSettingsInstance.findAllByType(BaseSettings)).toHaveLength(
      withNoPerm.length + withImportPerm.length
    );
  });

  test("with Permission.Statistics", async () => {
    mockGetCurrentPermissions.mockResolvedValue([Permission.Statistics]);
    await updateProjSettings();
    for (const component of withStatsPerm) {
      expect(projSettingsInstance.findByType(component)).toBeTruthy();
    }
    expect(projSettingsInstance.findAllByType(BaseSettings)).toHaveLength(
      withNoPerm.length + withStatsPerm.length
    );

    expect(
      projSettingsInstance.findByType(ProjectSchedule).props.readOnly
    ).toBeFalsy();
  });*/
});
