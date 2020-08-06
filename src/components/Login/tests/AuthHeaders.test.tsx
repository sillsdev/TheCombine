import { getToken, setToken } from "../../../backend/localStorage";
import authHeader from "../AuthHeaders";

let oldToken: string;

beforeAll(() => {
  oldToken = getToken();
});

beforeEach(() => {
  setToken("");
});

afterAll(() => {
  setToken(oldToken);
});

describe("AuthHeaders Tests", () => {
  test("Creates header that includes token", () => {
    setToken("testToken");
    const authHeaderOut = authHeader();
    expect(authHeaderOut.authorization).toMatch(/testToken/);
  });

  test("Creates empty header if no token", () => {
    const authHeaderOut = authHeader();
    expect(authHeaderOut).toEqual({});
  });
});
