import { useEffect, useState } from "react";

import { UserStub } from "api";
import { avatarSrc } from "backend";
import { Hash } from "types/hash";

export function useUserAvatar(users: UserStub[]): { userAvatar: Hash<string> } {
  const [userAvatar, setUserAvatar] = useState<Hash<string>>({});

  useEffect(() => {
    let canceled = false;
    const newUserAvatar: Hash<string> = {};
    const promises = users.map(async (u) => {
      if (u.hasAvatar) {
        newUserAvatar[u.id] = await avatarSrc(u.id);
      }
    });
    Promise.all(promises).then(() => {
      if (!canceled) {
        setUserAvatar(newUserAvatar);
      }
    });

    return () => {
      canceled = true;
    };
  }, [users]);

  return { userAvatar };
}
