import * as LocalStorage from "../../../backend/localStorage";
import { User } from "../../../types/user";
import authHeader from "../AuthHeaders";

let oldUser: User | null;

beforeAll(() => {
  oldUser = LocalStorage.getCurrentUser();
});

beforeEach(() => {
  LocalStorage.remove(LocalStorage.LocalStorageKey.User);
});

afterAll(() => {
  if (oldUser) {
    LocalStorage.setCurrentUser(oldUser);
  }
});

describe("AuthHeaders Tests", () => {
  test("Creates header that includes token", () => {
    let user: User = new User("", "", "");
    user.token = "testToken";
    LocalStorage.setCurrentUser(user);
    const authHeaderOut = authHeader();
    expect(authHeaderOut.authorization).toMatch(/testToken/);
  });

  test("Creates empty header if no token", () => {
    const authHeaderOut = authHeader();
    expect(authHeaderOut).toEqual({});
  });
});
