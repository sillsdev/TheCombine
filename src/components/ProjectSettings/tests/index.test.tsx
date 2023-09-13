import {
  Archive,
  CalendarMonth,
  CloudUpload,
  Edit,
  GetApp,
  Language,
  People,
  PersonAdd,
  Sms,
} from "@mui/icons-material";
import { ElementType } from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Permission } from "api/models";
import SettingsBase from "components/BaseSettings";
import ProjectSettings from "components/ProjectSettings";
import ProjectLanguages from "components/ProjectSettings/ProjectLanguages";
import ProjectSchedule from "components/ProjectSettings/ProjectSchedule";
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

let projSettingsRenderer: renderer.ReactTestRenderer;
let projSettingsInstance: renderer.ReactTestInstance;

const updateProjSettings = async () => {
  await renderer.act(async () => {
    // For this update to trigger a permissions refresh, project.id must change.
    // This is accomplished by randomProject() in createMockStore().
    projSettingsRenderer.update(
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
  await renderer.act(async () => {
    projSettingsRenderer = renderer.create(
      <Provider store={createMockStore()}>
        <ProjectSettings />
      </Provider>
    );
  });
  projSettingsInstance = projSettingsRenderer.root;
});

beforeEach(() => {
  resetMocks();
});

const withNoPerm = [
  Language, // icon for ProjectLanguages (but readOnly w/o DeleteEditPerm)
  CalendarMonth, // icon for ProjectSchedule (but readOnly w/o StatsPerm)
];
const withArchivePerm = [Archive]; // icon for archive component
const withDeleteEditPerm = [
  Edit, // icon for ProjectName
  People, // icon for ActiveProjectUsers
  PersonAdd, // icon for AddProjectUsers
  Sms, // icon for ProjectAutocomplete
];
const withExportPerm = [GetApp]; // icon for ExportButton
const withImportPerm = [CloudUpload]; // icon for ProjectImport
const withStatsPerm: ElementType[] = [];

describe("ProjectSettings", () => {
  test("with no permissions", async () => {
    await updateProjSettings();
    for (const component of withNoPerm) {
      expect(projSettingsInstance.findByType(component)).toBeTruthy();
    }
    expect(projSettingsInstance.findAllByType(SettingsBase)).toHaveLength(
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
    expect(projSettingsInstance.findAllByType(SettingsBase)).toHaveLength(
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
    expect(projSettingsInstance.findAllByType(SettingsBase)).toHaveLength(
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
    expect(projSettingsInstance.findAllByType(SettingsBase)).toHaveLength(
      withNoPerm.length + withExportPerm.length
    );
  });

  test("with Permission.Import", async () => {
    mockGetCurrentPermissions.mockResolvedValue([Permission.Import]);
    await updateProjSettings();
    for (const component of withImportPerm) {
      expect(projSettingsInstance.findByType(component)).toBeTruthy();
    }
    expect(projSettingsInstance.findAllByType(SettingsBase)).toHaveLength(
      withNoPerm.length + withImportPerm.length
    );
  });

  test("with Permission.Statistics", async () => {
    mockGetCurrentPermissions.mockResolvedValue([Permission.Statistics]);
    await updateProjSettings();
    for (const component of withStatsPerm) {
      expect(projSettingsInstance.findByType(component)).toBeTruthy();
    }
    expect(projSettingsInstance.findAllByType(SettingsBase)).toHaveLength(
      withNoPerm.length + withStatsPerm.length
    );

    expect(
      projSettingsInstance.findByType(ProjectSchedule).props.readOnly
    ).toBeFalsy();
  });
});
