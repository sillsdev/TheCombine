import { User } from "api/models";
import * as LocalStorage from "backend/localStorage";
import authHeader from "components/Login/AuthHeaders";
import { newUser } from "types/user";

let oldUser: User | undefined;

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
    const user = newUser();
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
