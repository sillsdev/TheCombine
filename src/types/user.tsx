export class User {
  name: string;
  username: string;
  id: string;
  userEditId: string;
  avatar: string;
  email: string;
  otherConnectionField: string;
  workedProjects: string[];
  agreement: boolean;
  password: string;
  uiLang: string;
  token: string;

  constructor(name: string, username: string, password: string) {
    this.name = name;
    this.username = username;
    this.id = "";
    this.userEditId = "";
    this.avatar = "";
    this.email = "";
    this.otherConnectionField = "";
    this.workedProjects = [];
    this.agreement = false;
    this.password = password;
    this.uiLang = "";
    this.token = "";
  }
}
