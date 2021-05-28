import { User } from "types/user";
import * as LocalStorage from "backend/localStorage";

const mockAvatar = "mockAvatar";
const mockProjectId = "mockProjId";
const mockUserId = "mockUserId";
const mockUser = new User("mockName", "mockUsername", "mockPass");
mockUser.id = mockUserId;

let oldAvatar: string;
let oldProjectId: string;
let oldUser: User | undefined;

beforeAll(() => {
  oldAvatar = LocalStorage.getAvatar();
  oldProjectId = LocalStorage.getProjectId();
  oldUser = LocalStorage.getCurrentUser();
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
  LocalStorage.setProjectId(oldProjectId);
});

function expectAllEmpty() {
  expect(LocalStorage.getAvatar()).toEqual("");
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
    LocalStorage.setCurrentUser(mockUser);
    expect(LocalStorage.getCurrentUser()).toEqual(mockUser);
    expect(LocalStorage.getUserId()).toEqual(mockUser.id);
    LocalStorage.setProjectId(mockProjectId);
    expect(LocalStorage.getProjectId()).toEqual(mockProjectId);

    LocalStorage.clearLocalStorage();
    expectAllEmpty();
  });
});
