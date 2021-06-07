import { User } from "api/models";

export function newUser(
  name: string = "",
  username: string = "",
  password: string = ""
): User {
  return {
    name,
    username,
    password,
    id: "",
    avatar: "",
    hasAvatar: false,
    email: "",
    phone: "",
    otherConnectionField: "",
    projectRoles: {},
    workedProjects: {},
    agreement: false,
    uiLang: "",
    token: "",
    isAdmin: false,
  };
}
