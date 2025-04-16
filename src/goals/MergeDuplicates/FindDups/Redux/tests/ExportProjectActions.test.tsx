import {
  asyncDownloadExport,
  asyncExportProject,
  asyncResetExport,
} from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { setupStore } from "rootRedux/store";
import { persistedDefaultState } from "rootRedux/testTypes";

jest.mock("backend", () => ({
  deleteLift: jest.fn,
  downloadLift: (...args: any[]) => mockDownloadList(...args),
  exportLift: (...args: any[]) => mockExportLift(...args),
}));
jest.mock("components/Project/ProjectActions", () => ({}));

const mockDownloadList = jest.fn();
const mockExportLift = jest.fn();
const mockProjId = "project-id";

describe("ExportProjectActions", () => {
  describe("asyncDownloadExport", () => {
    it("correctly affects state on success", async () => {
      const store = setupStore();
      mockDownloadList.mockResolvedValueOnce({});
      await store.dispatch(asyncDownloadExport(mockProjId));
      const { projectId, status } = store.getState().exportProjectState;
      expect(projectId).toEqual(mockProjId);
      expect(status).toEqual(ExportStatus.Downloading);
    });

    it("correctly affects state on failure", async () => {
      const store = setupStore();
      mockDownloadList.mockRejectedValueOnce({});
      await store.dispatch(asyncDownloadExport(mockProjId));
      const { projectId, status } = store.getState().exportProjectState;
      expect(projectId).toEqual(mockProjId);
      expect(status).toEqual(ExportStatus.Failure);
    });
  });

  describe("asyncExportProject", () => {
    it("correctly affects state on success", async () => {
      const store = setupStore();
      mockExportLift.mockResolvedValueOnce({});
      await store.dispatch(asyncExportProject(mockProjId));
      const { projectId, status } = store.getState().exportProjectState;
      expect(projectId).toEqual(mockProjId);
      expect(status).toEqual(ExportStatus.Exporting);
    });

    it("correctly affects state on failure", async () => {
      const store = setupStore();
      mockExportLift.mockRejectedValueOnce({});
      await store.dispatch(asyncExportProject(mockProjId));
      const { projectId, status } = store.getState().exportProjectState;
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
      const store = setupStore({
        ...persistedDefaultState,
        exportProjectState: nonDefaultState,
      });
      await store.dispatch(asyncResetExport());
      const { projectId, status } = store.getState().exportProjectState;
      expect(projectId).toEqual("");
      expect(status).toEqual(ExportStatus.Default);
    });
  });
});
