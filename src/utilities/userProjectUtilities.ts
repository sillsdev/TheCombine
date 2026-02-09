import { UserProjectInfo } from "api/models";

/** Compare two UserProjectInfo objects for sorting purposes.
 * Active projects come before inactive ones; then sort by project name. */
export function compareUserProjectInfo(
  a: UserProjectInfo,
  b: UserProjectInfo
): number {
  if (a.projectIsActive !== b.projectIsActive) {
    return a.projectIsActive ? -1 : 1;
  }
  return a.projectName.localeCompare(b.projectName);
}
