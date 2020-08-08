import { Hash } from "../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";

export class User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  phone: string;
  otherConnectionField: string;
  projectRoles: Hash<string>;
  workedProjects: Hash<string>;
  agreement: boolean;
  password: string;
  username: string;
  uiLang: string;
  token: string;
  isAdmin: boolean;

  constructor(name: string, username: string, password: string) {
    this.id = "";
    this.avatar = "";
    this.name = name;
    this.email = "";
    this.phone = "";
    this.otherConnectionField = "";
    this.projectRoles = {};
    this.workedProjects = {};
    this.agreement = false;
    this.password = password;
    this.username = username;
    this.uiLang = "";
    this.token = "";
    this.isAdmin = false;
  }
}
