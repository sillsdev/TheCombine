import { UserProjectInfo } from "api/models";

export function compareUserProjectInfo(
  a: UserProjectInfo,
  b: UserProjectInfo
): number {
  if (a.projectIsActive !== b.projectIsActive) {
    return a.projectIsActive ? -1 : 1;
  }
  return a.projectName.localeCompare(b.projectName);
}
