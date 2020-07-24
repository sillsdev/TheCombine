import { User } from "../../types/user";
import * as LocalStorage from "../localStorage";

let mockUser: User = new User("mockName", "mockUsername", "mockPassword");
let mockProjectId: string = "mockProjId";
let oldUser: User | null;
let oldProjectId: string;

beforeAll(() => {
  oldUser = LocalStorage.getCurrentUser();
  oldProjectId = LocalStorage.getProjectId();
});

beforeEach(() => {
  LocalStorage.removeCurrentUser();
  LocalStorage.removeProjectId();
});

afterAll(() => {
  LocalStorage.removeCurrentUser();
  if (oldUser) LocalStorage.setCurrentUser(oldUser);
  LocalStorage.setProjectId(oldProjectId);
});

describe("Test GoalsActions", () => {
  it("should return the set user", () => {
    LocalStorage.setCurrentUser(mockUser);
    expect(LocalStorage.getCurrentUser()).toEqual(mockUser);
  });

  it("should return null when there is no user", () => {
    expect(LocalStorage.getCurrentUser()).toEqual(null);
  });

  it("should return the set projectId", () => {
    LocalStorage.setProjectId(mockProjectId);
    expect(LocalStorage.getProjectId()).toEqual(mockProjectId);
  });

  it("should return empty string when there is no project id", () => {
    expect(LocalStorage.getProjectId()).toEqual("");
  });
});
