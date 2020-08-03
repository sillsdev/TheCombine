import { User } from "../../types/user";
import { getUser } from "../";
import * as LocalStorage from "../localStorage";

const mockName: string = "mockName";
const mockToken: string = "mockToken";
const mockUserId: string = "mockUserId";
const mockUsername: string = "mockUsername";
let mockUser: User = new User(mockName, mockUsername, "mockPassword");
mockUser.id = mockUserId;
mockUser.token = mockToken;
let mockProjectId: string = "mockProjId";
let oldUserId: string;
let oldProjectId: string;

beforeAll(() => {
  oldUserId = LocalStorage.getUserId();
  oldProjectId = LocalStorage.getProjectId();
});

beforeEach(() => {
  LocalStorage.clearLocalStorage();
});

afterAll(() => {
  LocalStorage.clearLocalStorage();
  if (oldUserId) {
    getUser(oldUserId).then((User) => LocalStorage.setUser(User));
  }
  LocalStorage.setProjectId(oldProjectId);
});

describe("Test GoalsActions", () => {
  it("should return the set userId", () => {
    LocalStorage.setUserId(mockUserId);
    expect(LocalStorage.getUserId()).toEqual(mockUserId);
  });

  it("should return empty string when there is no userId", () => {
    expect(LocalStorage.getUserId()).toEqual("");
  });

  it("should set id, username, and token when setting a user", () => {
    LocalStorage.setUser(mockUser);
    expect(LocalStorage.getUserId()).toEqual(mockUser.id);
    expect(LocalStorage.getUsername()).toEqual(mockUser.username);
    expect(LocalStorage.getUserToken()).toEqual(mockUser.token);
  });

  it("should return the set projectId", () => {
    LocalStorage.setProjectId(mockProjectId);
    expect(LocalStorage.getProjectId()).toEqual(mockProjectId);
  });

  it("should return empty string when there is no project id", () => {
    expect(LocalStorage.getProjectId()).toEqual("");
  });
});
