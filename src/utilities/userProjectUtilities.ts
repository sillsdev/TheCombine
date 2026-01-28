import { UserProjectInfo } from "api/models";

export function compareUserProjectInfo(
  a: UserProjectInfo,
  b: UserProjectInfo
): number {
  return a.projectIsActive && !b.projectIsActive
    ? -1
    : !a.projectIsActive && b.projectIsActive
      ? 1
      : a.projectName.localeCompare(b.projectName);
}
