import { Project } from "api/models";

export interface ProjectSettingPropsWithSet {
  project: Project;
  setProject: (project: Project) => void;
}

export interface ProjectSettingPropsWithUpdate {
  project: Project;
  updateProject: (project: Project) => Promise<void>;
}
