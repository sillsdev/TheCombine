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
