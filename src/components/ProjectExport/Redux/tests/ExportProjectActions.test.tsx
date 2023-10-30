import { PreloadedState } from "redux";

import { defaultState } from "components/App/DefaultState";
import {
  asyncDownloadExport,
  asyncExportProject,
  asyncResetExport,
} from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { RootState, setupStore } from "store";

jest.mock("backend", () => ({
  deleteLift: jest.fn,
  downloadLift: (...args: any[]) => mockDownloadList(...args),
  exportLift: (...args: any[]) => mockExportLift(...args),
}));

const mockDownloadList = jest.fn();
const mockExportLift = jest.fn();
const mockProjId = "project-id";

// Preloaded values for store when testing
const persistedDefaultState: PreloadedState<RootState> = {
  ...defaultState,
  _persist: { version: 1, rehydrated: false },
};

describe("ExportProjectActions", () => {
  describe("asyncDownloadExport", () => {
    it("correctly affects state on success", async () => {
      const mockStore = setupStore();
      mockDownloadList.mockResolvedValueOnce({});
      await mockStore.dispatch<any>(asyncDownloadExport(mockProjId));
      const { projectId, status } = mockStore.getState().exportProjectState;
      expect(projectId).toEqual(mockProjId);
      expect(status).toEqual(ExportStatus.Downloading);
    });

    it("correctly affects state on failure", async () => {
      const mockStore = setupStore();
      mockDownloadList.mockRejectedValueOnce({});
      await mockStore.dispatch<any>(asyncDownloadExport(mockProjId));
      const { projectId, status } = mockStore.getState().exportProjectState;
      expect(projectId).toEqual(mockProjId);
      expect(status).toEqual(ExportStatus.Failure);
    });
  });

  describe("asyncExportProject", () => {
    it("correctly affects state on success", async () => {
      const mockStore = setupStore();
      mockExportLift.mockResolvedValueOnce({});
      await mockStore.dispatch<any>(asyncExportProject(mockProjId));
      const { projectId, status } = mockStore.getState().exportProjectState;
      expect(projectId).toEqual(mockProjId);
      expect(status).toEqual(ExportStatus.Exporting);
    });

    it("correctly affects state on failure", async () => {
      const mockStore = setupStore();
      mockExportLift.mockRejectedValueOnce({});
      await mockStore.dispatch<any>(asyncExportProject(mockProjId));
      const { projectId, status } = mockStore.getState().exportProjectState;
      expect(projectId).toEqual(mockProjId);
      expect(status).toEqual(ExportStatus.Failure);
    });
  });

  describe("asyncResetExport", () => {
    it("correctly affects state", async () => {
      const nonDefaultState = {
        projectId: "nonempty-string",
        status: ExportStatus.Success,
      };
      const mockStore = setupStore({
        ...persistedDefaultState,
        exportProjectState: nonDefaultState,
      });
      await mockStore.dispatch<any>(asyncResetExport());
      const { projectId, status } = mockStore.getState().exportProjectState;
      expect(projectId).toEqual("");
      expect(status).toEqual(ExportStatus.Default);
    });
  });
});
