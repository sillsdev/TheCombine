import { Hash } from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";

export class User {
  id: string = "";
  avatar: string = "";
  hasAvatar: boolean = false;
  email: string = "";
  phone: string = "";
  otherConnectionField: string = "";
  projectRoles: Hash<string> = {};
  workedProjects: Hash<string> = {};
  agreement: boolean = false;
  uiLang: string = "";
  token: string = "";
  isAdmin: boolean = false;

  constructor(
    public name: string,
    public username: string,
    public password: string
  ) {}
}
