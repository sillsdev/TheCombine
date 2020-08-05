import { Hash } from "../../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { User } from "../../types/user";
import * as LocalStorage from "../localStorage";

const mockAvatar: string = "mockAvatar";
const mockBlacklist: Hash<boolean> = { mockKey: true };
const mockProjectId: string = "mockProjId";
const mockToken: string = "mockToken";
const mockUserId: string = "mockUserId";
const mockUser: User = {
  ...new User("mockName", "mockUsername", "mockPassword"),
  id: mockUserId,
};

let oldAvatar: string;
let oldMergeDupsBlacklist: Hash<boolean>;
let oldProjectId: string;
let oldToken: string;
let oldUserId: string;

beforeAll(() => {
  oldAvatar = LocalStorage.getAvatar();
  oldMergeDupsBlacklist = LocalStorage.getMergeDupsBlacklist();
  oldProjectId = LocalStorage.getProjectId();
  oldToken = LocalStorage.getToken();
  oldUserId = LocalStorage.getUserId();
});

beforeEach(() => {
  LocalStorage.clearLocalStorage();
});

afterAll(() => {
  LocalStorage.clearLocalStorage();
  if (oldUserId) {
    LocalStorage.updateUser(oldUserId);
  }
  LocalStorage.setAvatar(oldAvatar);
  LocalStorage.setMergeDupsBlacklist(oldMergeDupsBlacklist);
  LocalStorage.setProjectId(oldProjectId);
  LocalStorage.setToken(oldToken);
});

describe("Test localStorage", () => {
  it("should return empty elements when nothing has been stored", () => {
    expect(LocalStorage.getAvatar()).toEqual("");
    expect(LocalStorage.getCurrentUser()).toEqual(undefined);
    expect(LocalStorage.getMergeDupsBlacklist()).toEqual({});
    expect(LocalStorage.getProjectId()).toEqual("");
    expect(LocalStorage.getToken()).toEqual("");
    expect(LocalStorage.getUserId()).toEqual("");
  });

  it("should set user and userId when setting a user", () => {
    LocalStorage.setCurrentUser(mockUser);
    expect(LocalStorage.getCurrentUser()).toEqual(mockUser);
    expect(LocalStorage.getUserId()).toEqual(mockUser.id);
  });

  it("should return the set value", () => {
    LocalStorage.setAvatar(mockAvatar);
    expect(LocalStorage.getAvatar()).toEqual(mockAvatar);
    LocalStorage.setMergeDupsBlacklist(mockBlacklist);
    expect(LocalStorage.getMergeDupsBlacklist()).toEqual(mockBlacklist);
    LocalStorage.setProjectId(mockProjectId);
    expect(LocalStorage.getProjectId()).toEqual(mockProjectId);
    LocalStorage.setToken(mockToken);
    expect(LocalStorage.getToken()).toEqual(mockToken);
    LocalStorage.setUserId(mockUserId);
    expect(LocalStorage.getUserId()).toEqual(mockUserId);
  });
});
