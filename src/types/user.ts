import { User } from "api/models";

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
    token: "",
    isAdmin: false,
  };
}

export function doesTextMatchUser(text: string, user: User): boolean {
  const lower = text.toLocaleLowerCase();
  return (
    user.name.toLocaleLowerCase().includes(lower) ||
    user.username.toLocaleLowerCase().includes(lower) ||
    user.email.toLocaleLowerCase().includes(lower)
  );
}
