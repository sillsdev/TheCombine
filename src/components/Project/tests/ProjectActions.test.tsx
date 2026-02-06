import { type Project, type Speaker } from "api/models";
import {
  asyncRefreshProjectUsers,
  asyncSetNewCurrentProject,
  asyncUpdateCurrentProject,
  clearCurrentProject,
} from "components/Project/ProjectActions";
import { defaultState as currentProjectState } from "components/Project/ProjectReduxTypes";
import { setupStore } from "rootRedux/store";
import { persistedDefaultState } from "rootRedux/testTypes";
import { newProject } from "types/project";
import { newUser } from "types/user";

jest.mock("backend", () => ({
  getAllProjectUsers: (projId?: string) => mockGetAllProjectUsers(projId),
  getAllSemanticDomainNames: (lang?: string) => mockGetAllSemDomNames(lang),
  updateProject: (proj: Project) => mockUpdateProject(proj),
}));
// Mock "i18n", else `thrown: "Error: Error: connect ECONNREFUSED ::1:80 [...]`
jest.mock("i18n", () => ({ language: "" }));

const mockGetAllProjectUsers = jest.fn();
const mockGetAllSemDomNames = jest.fn();
const mockUpdateProject = jest.fn();
const mockProjId = "project-id";

describe("ProjectActions", () => {
  describe("asyncUpdateCurrentProject", () => {
    it("updates the backend and correctly affects state for different id", async () => {
      const proj: Project = { ...newProject(), id: mockProjId };
      const store = setupStore({
        ...persistedDefaultState,
        currentProjectState: {
          ...currentProjectState,
          project: proj,
          speaker: {} as Speaker,
          users: [newUser()],
        },
      });
      const id = "new-id";
      await store.dispatch(asyncUpdateCurrentProject({ ...proj, id }));
      expect(mockUpdateProject).toHaveBeenCalledTimes(1);
      const { project, speaker, users } = store.getState().currentProjectState;
      expect(project.id).toEqual(id);
      expect(speaker).toBeUndefined();
      expect(users).toHaveLength(0);
    });

    it("updates the backend and correctly affects state for same id", async () => {
      const proj: Project = { ...newProject(), id: mockProjId };
      const store = setupStore({
        ...persistedDefaultState,
        currentProjectState: {
          ...currentProjectState,
          project: proj,
          speaker: {} as Speaker,
          users: [newUser()],
        },
      });
      const name = "new-name";
      await store.dispatch(asyncUpdateCurrentProject({ ...proj, name }));
      expect(mockUpdateProject).toHaveBeenCalledTimes(1);
      const { project, speaker, users } = store.getState().currentProjectState;
      expect(project.name).toEqual(name);
      expect(speaker).not.toBeUndefined();
      expect(users).toHaveLength(1);
    });

    it("fetches semantic domain names when semDomWritingSystem changes", async () => {
      const proj: Project = { ...newProject(), id: mockProjId };
      const store = setupStore({
        ...persistedDefaultState,
        currentProjectState: {
          ...currentProjectState,
          project: { ...proj },
          semanticDomains: { ["1"]: "one" },
        },
      });

      // Project update but same sem dom language
      proj.liftImported = !proj.liftImported;
      await store.dispatch(asyncUpdateCurrentProject({ ...proj }));
      expect(mockUpdateProject).toHaveBeenCalledTimes(1);
      expect(mockGetAllSemDomNames).not.toHaveBeenCalled();

      // Project update with different sem dom language
      const lang = "es";
      proj.semDomWritingSystem = { ...proj.semDomWritingSystem, bcp47: lang };
      await store.dispatch(asyncUpdateCurrentProject({ ...proj }));
      expect(mockUpdateProject).toHaveBeenCalledTimes(2);
      expect(mockGetAllSemDomNames).toHaveBeenCalledTimes(1);
      expect(mockGetAllSemDomNames).toHaveBeenCalledWith(lang);
    });
  });

  describe("asyncRefreshProjectUsers", () => {
    it("correctly affects state", async () => {
      const store = setupStore({
        ...persistedDefaultState,
        currentProjectState: {
          ...currentProjectState,
          project: { ...newProject(), id: mockProjId },
          semanticDomains: { ["1"]: "one" },
          speaker: {} as Speaker,
        },
      });
      const mockUsers = [newUser(), newUser(), newUser()];
      mockGetAllProjectUsers.mockResolvedValueOnce(mockUsers);
      await store.dispatch(asyncRefreshProjectUsers("mockProjId"));
      const projState = store.getState().currentProjectState;
      expect(projState.project.id).toEqual(mockProjId);
      expect(projState.semanticDomains).not.toBeUndefined();
      expect(projState.speaker).not.toBeUndefined();
      expect(projState.users).toHaveLength(mockUsers.length);
    });
  });

  describe("clearCurrentProject", () => {
    it("correctly affects state", () => {
      const store = setupStore({
        ...persistedDefaultState,
        currentProjectState: {
          ...currentProjectState,
          project: { ...newProject(), id: mockProjId },
          semanticDomains: { ["1"]: "one" },
          speaker: {} as Speaker,
          users: [newUser()],
        },
      });
      store.dispatch(clearCurrentProject());
      const projState = store.getState().currentProjectState;
      expect(projState.project.id).toEqual("");
      expect(projState.semanticDomains).toBeUndefined();
      expect(projState.speaker).toBeUndefined();
      expect(projState.users).toHaveLength(0);
    });
  });

  describe("asyncSetNewCurrentProject", () => {
    it("correctly affects state and doesn't update the backend", async () => {
      const proj: Project = { ...newProject(), id: mockProjId };
      const store = setupStore();
      await store.dispatch(asyncSetNewCurrentProject(proj));
      expect(mockGetAllSemDomNames).toHaveBeenCalledTimes(1);
      expect(mockUpdateProject).not.toHaveBeenCalled();
      const { project } = store.getState().currentProjectState;
      expect(project.id).toEqual(mockProjId);
    });
  });
});
