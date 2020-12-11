import { Hash } from "../../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { User } from "../../types/user";
import * as LocalStorage from "../localStorage";

const mockAvatar: string = "mockAvatar";
const mockBlacklist: Hash<boolean> = { mockKey: true };
const mockProjectId: string = "mockProjId";
const mockUserId: string = "mockUserId";
const mockUser: User = {
  ...new User("mockName", "mockUsername", "mockPass"),
  id: mockUserId,
};

let oldAvatar: string;
let oldMergeDupsBlacklist: Hash<boolean>;
let oldProjectId: string;
let oldUser: User | undefined;

beforeAll(() => {
  oldAvatar = LocalStorage.getAvatar();
  oldMergeDupsBlacklist = LocalStorage.getMergeDupsBlacklist();
  oldProjectId = LocalStorage.getProjectId();
});

beforeEach(() => {
  LocalStorage.clearLocalStorage();
});

afterAll(() => {
  LocalStorage.clearLocalStorage();
  LocalStorage.setAvatar(oldAvatar);
  if (oldUser) {
    LocalStorage.setCurrentUser(oldUser);
  }
  LocalStorage.setMergeDupsBlacklist(oldMergeDupsBlacklist);
  LocalStorage.setProjectId(oldProjectId);
});

function expectAllEmpty() {
  expect(LocalStorage.getAvatar()).toEqual("");
  expect(LocalStorage.getCurrentUser()).toEqual(null);
  expect(LocalStorage.getMergeDupsBlacklist()).toEqual({});
  expect(LocalStorage.getProjectId()).toEqual("");
  expect(LocalStorage.getUserId()).toEqual("");
}

describe("LocalStorage", () => {
  it("should return empty elements when nothing has been stored", () => {
    expectAllEmpty();
  });

  it("should return the set value, then clear on reset", () => {
    LocalStorage.setAvatar(mockAvatar);
    expect(LocalStorage.getAvatar()).toEqual(mockAvatar);
    LocalStorage.setCurrentUser(mockUser);
    expect(LocalStorage.getCurrentUser()).toEqual(mockUser);
    expect(LocalStorage.getUserId()).toEqual(mockUser.id);
    LocalStorage.setMergeDupsBlacklist(mockBlacklist);
    expect(LocalStorage.getMergeDupsBlacklist()).toEqual(mockBlacklist);
    LocalStorage.setProjectId(mockProjectId);
    expect(LocalStorage.getProjectId()).toEqual(mockProjectId);

    LocalStorage.clearLocalStorage();
    expectAllEmpty();
  });
});
