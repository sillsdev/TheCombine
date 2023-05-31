import { Project } from "api/models";

export interface ProjectSettingProps {
  project: Project;
  updateProject: (project: Project) => Promise<void>;
}
