import { Hash } from "../../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { User } from "../../types/user";
import { getUser } from "../";
import * as LocalStorage from "../localStorage";

const mockAvatar: string = "mockAvatar";
const mockBlacklist: Hash<boolean> = { mockKey: true };
const mockName: string = "mockName";
const mockProjectId: string = "mockProjId";
const mockToken: string = "mockToken";
const mockUserId: string = "mockUserId";
const mockUsername: string = "mockUsername";
const mockWorkedProjects: Hash<string> = { mockKey: "mockValue" };
let mockUser: User = new User(mockName, mockUsername, "mockPassword");
mockUser.id = mockUserId;
mockUser.workedProjects = mockWorkedProjects;

let oldAvatar: string;
let oldMergeDupsBlacklist: Hash<boolean>;
let oldProjectId: string;
let oldUserId: string;
let oldUserToken: string;

beforeAll(() => {
  oldAvatar = LocalStorage.getAvatar();
  oldMergeDupsBlacklist = LocalStorage.getMergeDupsBlacklist();
  oldProjectId = LocalStorage.getProjectId();
  oldUserId = LocalStorage.getUserId();
  oldUserToken = LocalStorage.getUserToken();
});

beforeEach(() => {
  LocalStorage.clearLocalStorage();
});

afterAll(() => {
  LocalStorage.clearLocalStorage();
  if (oldUserId) {
    getUser(oldUserId).then((User) => LocalStorage.setUser(User));
  }
  LocalStorage.setAvatar(oldAvatar);
  LocalStorage.setMergeDupsBlacklist(oldMergeDupsBlacklist);
  LocalStorage.setProjectId(oldProjectId);
  LocalStorage.setUserToken(oldUserToken);
});

describe("Test localStorage", () => {
  it("should return empty elements when nothing has been stored", () => {
    expect(LocalStorage.getAvatar()).toEqual("");
    expect(LocalStorage.getMergeDupsBlacklist()).toEqual({});
    expect(LocalStorage.getProjectId()).toEqual("");
    expect(LocalStorage.getUserId()).toEqual("");
    expect(LocalStorage.getUsername()).toEqual("");
    expect(LocalStorage.getUserToken()).toEqual("");
    expect(LocalStorage.getWorkedProjects()).toEqual({});
  });

  it("should set id, username, workedProjects when setting a user", () => {
    LocalStorage.setUser(mockUser);
    expect(LocalStorage.getUserId()).toEqual(mockUser.id);
    expect(LocalStorage.getUsername()).toEqual(mockUser.username);
    expect(LocalStorage.getWorkedProjects()).toEqual(mockUser.workedProjects);
  });

  it("should return the set value", () => {
    LocalStorage.setAvatar(mockAvatar);
    expect(LocalStorage.getAvatar()).toEqual(mockAvatar);
    LocalStorage.setMergeDupsBlacklist(mockBlacklist);
    expect(LocalStorage.getMergeDupsBlacklist()).toEqual(mockBlacklist);
    LocalStorage.setProjectId(mockProjectId);
    expect(LocalStorage.getProjectId()).toEqual(mockProjectId);
    LocalStorage.setUserId(mockUserId);
    expect(LocalStorage.getUserId()).toEqual(mockUserId);
    LocalStorage.setUsername(mockUsername);
    expect(LocalStorage.getUsername()).toEqual(mockUsername);
    LocalStorage.setUserToken(mockToken);
    expect(LocalStorage.getUserToken()).toEqual(mockToken);
    LocalStorage.setWorkedProjects(mockWorkedProjects);
    expect(LocalStorage.getWorkedProjects()).toEqual(mockWorkedProjects);
  });
});
