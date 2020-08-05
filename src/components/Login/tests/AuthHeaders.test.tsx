import { getUserToken, setUserToken } from "../../../backend/localStorage";
import authHeader from "../AuthHeaders";

let oldUserToken: string;

beforeAll(() => {
  oldUserToken = getUserToken();
});

beforeEach(() => {
  setUserToken("");
});

afterAll(() => {
  setUserToken(oldUserToken);
});

describe("AuthHeaders Tests", () => {
  test("Creates header that includes token", () => {
    setUserToken("testToken");
    const authHeaderOut = authHeader();
    expect(authHeaderOut.authorization).toMatch(/testToken/);
  });

  test("Creates empty header if user has no token prop", () => {
    const authHeaderOut = authHeader();
    expect(authHeaderOut).toEqual({});
  });
});
