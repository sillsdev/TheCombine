import { useEffect, useState } from "react";

import { type Permission } from "api/models";
import { getCurrentPermissions } from "backend";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

/** Returns the current user's permissions for the active project.
 * Re-fetches when the project changes. Returns [] when no project is selected
 * or on error. */
export function useCurrentPermissions(): Permission[] {
  const projectId = useAppSelector(
    (state: StoreState) => state.currentProjectState.project.id
  );
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    setPermissions([]);
    if (!projectId) {
      return;
    }

    let isCancelled = false;
    getCurrentPermissions()
      .then((perms) => {
        if (!isCancelled) setPermissions(perms);
      })
      .catch(() => {
        if (!isCancelled) setPermissions([]);
      });

    return () => {
      isCancelled = true;
    };
  }, [projectId]);

  return permissions;
}
