import * as LocalStorage from "backend/localStorage";
import { LocalStorageKey } from "backend/localStorage";
import { newUser } from "types/user";

const mockAvatar = "mockAvatar";
const mockClosedBanner = "mockClosedBanner";
const mockProjectId = "mockProjId";
const mockUserId = "mockUserId";
const mockUser = newUser("mockName", "mockUsername", "mockPass");
mockUser.id = mockUserId;

const oldValues: { [key: string]: any } = {};

beforeAll(() => {
  for (const keyString in LocalStorageKey) {
    const key = LocalStorageKey[keyString as keyof typeof LocalStorageKey];
    oldValues[keyString] = localStorage.getItem(key);
  }
});

beforeEach(() => {
  LocalStorage.clearLocalStorage();
});

afterAll(() => {
  for (const keyString in LocalStorageKey) {
    const oldVal = oldValues[keyString];
    if (oldVal) {
      const key = LocalStorageKey[keyString as keyof typeof LocalStorageKey];
      localStorage.setItem(key, oldVal);
    }
  }
});

function expectAllEmpty() {
  expect(LocalStorage.getAvatar()).toEqual("");
  expect(LocalStorage.getClosedBanner()).toEqual("");
  expect(LocalStorage.getCurrentUser()).toEqual(undefined);
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
    LocalStorage.setClosedBanner(mockClosedBanner);
    expect(LocalStorage.getClosedBanner()).toEqual(mockClosedBanner);
    LocalStorage.setCurrentUser(mockUser);
    expect(LocalStorage.getCurrentUser()).toEqual(mockUser);
    expect(LocalStorage.getUserId()).toEqual(mockUser.id);
    LocalStorage.setProjectId(mockProjectId);
    expect(LocalStorage.getProjectId()).toEqual(mockProjectId);

    LocalStorage.clearLocalStorage();
    expectAllEmpty();
  });
});
