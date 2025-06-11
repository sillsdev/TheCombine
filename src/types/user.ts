import { OffOnSetting, User, UserStub } from "api/models";

export function newUser(name = "", username = "", password = ""): User {
  return {
    name,
    username,
    password,
    id: "",
    avatar: "",
    hasAvatar: false,
    email: "",
    phone: "",
    projectRoles: {},
    workedProjects: {},
    glossSuggestion: OffOnSetting.On,
    token: "",
    isAdmin: false,
  };
}

export function newUserStub(name = "", username = ""): UserStub {
  return { name, username, id: "", hasAvatar: false };
}

/** Returns whether the given `text` is a (case-insensitive) substring of the
 * name, username, or email of the given `user`. */
export function doesTextMatchUser(text: string, user: User): boolean {
  const lower = text.toLocaleLowerCase();
  return (
    user.name.toLocaleLowerCase().includes(lower) ||
    user.username.toLocaleLowerCase().includes(lower) ||
    user.email.toLocaleLowerCase().includes(lower)
  );
}
