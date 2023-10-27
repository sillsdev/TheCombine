import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import {
  asyncDownloadExport,
  asyncExportProject,
  asyncResetExport,
} from "components/ProjectExport/Redux/ExportProjectActions";
import {
  downloadingAction,
  exportingAction,
  failureAction,
  resetAction,
} from "components/ProjectExport/Redux/ExportProjectReducer";
import { defaultState } from "components/ProjectExport/Redux/ExportProjectReduxTypes";

jest.mock("backend", () => ({
  deleteLift: jest.fn,
  downloadLift: (...args: any[]) => mockDownloadList(...args),
  exportLift: (...args: any[]) => mockExportLift(...args),
}));

const mockDownloadList = jest.fn();
const mockExportLift = jest.fn();
const mockProjId = "project-id";
const mockStore = configureMockStore([thunk])(defaultState);

beforeEach(() => {
  mockStore.clearActions();
});

describe("ExportProjectActions", () => {
  describe("asyncDownloadExport", () => {
    it("correctly affects state on success", async () => {
      mockDownloadList.mockResolvedValueOnce({});
      await mockStore.dispatch<any>(asyncDownloadExport(mockProjId));
      expect(mockStore.getActions()).toEqual([downloadingAction(mockProjId)]);
    });

    it("correctly affects state on failure", async () => {
      mockDownloadList.mockRejectedValueOnce({});
      await mockStore.dispatch<any>(asyncDownloadExport(mockProjId));
      expect(mockStore.getActions()).toEqual([
        downloadingAction(mockProjId),
        failureAction(mockProjId),
      ]);
    });
  });

  describe("asyncExportProject", () => {
    it("correctly affects state on success", async () => {
      mockExportLift.mockResolvedValueOnce({});
      await mockStore.dispatch<any>(asyncExportProject(mockProjId));
      expect(mockStore.getActions()).toEqual([exportingAction(mockProjId)]);
    });

    it("correctly affects state on failure", async () => {
      mockExportLift.mockRejectedValueOnce({});
      await mockStore.dispatch<any>(asyncExportProject(mockProjId));
      expect(mockStore.getActions()).toEqual([
        exportingAction(mockProjId),
        failureAction(mockProjId),
      ]);
    });
  });

  describe("asyncResetExport", () => {
    it("correctly affects state", async () => {
      await mockStore.dispatch<any>(asyncResetExport());
      expect(mockStore.getActions()).toEqual([resetAction()]);
    });
  });
});
