import { PreloadedState } from "redux";

import { Project } from "api/models";
import { defaultState } from "components/App/DefaultState";
import {
  asyncRefreshProjectUsers,
  asyncUpdateCurrentProject,
  clearCurrentProject,
  setNewCurrentProject,
} from "components/Project/ProjectActions";
import { RootState, setupStore } from "store";
import { newProject } from "types/project";
import { newUser } from "types/user";

jest.mock("backend", () => ({
  getAllProjectUsers: (...args: any[]) => mockGetAllProjectUsers(...args),
  updateProject: (...args: any[]) => mockUpdateProject(...args),
}));

const mockGetAllProjectUsers = jest.fn();
const mockUpdateProject = jest.fn();
const mockProjId = "project-id";

// Preloaded values for store when testing
const persistedDefaultState: PreloadedState<RootState> = {
  ...defaultState,
  _persist: { version: 1, rehydrated: false },
};

describe("ProjectActions", () => {
  describe("asyncUpdateCurrentProject", () => {
    it("updates the backend and correctly affects state for different id", async () => {
      const proj: Project = { ...newProject(), id: mockProjId };
      const store = setupStore({
        ...persistedDefaultState,
        currentProjectState: { project: proj, users: [newUser()] },
      });
      const id = "new-id";
      await store.dispatch(asyncUpdateCurrentProject({ ...proj, id }));
      expect(mockUpdateProject).toHaveBeenCalledTimes(1);
      const { project, users } = store.getState().currentProjectState;
      expect(project.id).toEqual(id);
      expect(users).toHaveLength(0);
    });

    it("updates the backend and correctly affects state for same id", async () => {
      const proj: Project = { ...newProject(), id: mockProjId };
      const store = setupStore({
        ...persistedDefaultState,
        currentProjectState: { project: proj, users: [newUser()] },
      });
      const name = "new-name";
      await store.dispatch(asyncUpdateCurrentProject({ ...proj, name }));
      expect(mockUpdateProject).toHaveBeenCalledTimes(1);
      const { project, users } = store.getState().currentProjectState;
      expect(project.name).toEqual(name);
      expect(users).toHaveLength(1);
    });
  });

  describe("asyncRefreshProjectUsers", () => {
    it("correctly affects state", async () => {
      const proj: Project = { ...newProject(), id: mockProjId };
      const store = setupStore({
        ...persistedDefaultState,
        currentProjectState: { project: proj, users: [] },
      });
      const mockUsers = [newUser(), newUser(), newUser()];
      mockGetAllProjectUsers.mockResolvedValueOnce(mockUsers);
      await store.dispatch(asyncRefreshProjectUsers("mockProjId"));
      const { project, users } = store.getState().currentProjectState;
      expect(project.id).toEqual(mockProjId);
      expect(users).toHaveLength(mockUsers.length);
    });
  });

  describe("clearCurrentProject", () => {
    it("correctly affects state", () => {
      const nonDefaultState = {
        project: { ...newProject(), id: "nonempty-string" },
        users: [newUser()],
      };
      const store = setupStore({
        ...persistedDefaultState,
        currentProjectState: nonDefaultState,
      });
      store.dispatch(clearCurrentProject());
      const { project, users } = store.getState().currentProjectState;
      expect(project.id).toEqual("");
      expect(users).toHaveLength(0);
    });
  });

  describe("setNewCurrentProject", () => {
    it("correctly affects state and doesn't update the backend", () => {
      const proj: Project = { ...newProject(), id: mockProjId };
      const store = setupStore();
      store.dispatch(setNewCurrentProject(proj));
      expect(mockUpdateProject).not.toHaveBeenCalled();
      const { project } = store.getState().currentProjectState;
      expect(project.id).toEqual(mockProjId);
    });
  });
});
