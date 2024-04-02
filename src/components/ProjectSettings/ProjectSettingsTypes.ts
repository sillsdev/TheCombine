import { type Project } from "api/models";

export interface ProjectSettingProps {
  project: Project;
  readOnly?: boolean;
  setProject: (project: Project) => Promise<void>;
}
