import { Project } from "api/models";

export interface ProjectSettingPropsWithSet {
  project: Project;
  setProject: (project: Project) => void;
}

export interface ProjectSettingPropsWithUpdate {
  project: Project;
  readOnly?: boolean;
  updateProject: (project: Project) => Promise<void>;
}
