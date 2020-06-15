import { authHeaderWithUserGetter } from "../AuthHeaders";

const mockComponentWithToken = { token: "testToken" };
const mockUserGetter = jest.fn();

beforeEach(() => {
  mockUserGetter.mockReset();
});

describe("AuthHeaders Tests", () => {
  test("Creates header that includes token", () => {
    mockUserGetter.mockReturnValue(mockComponentWithToken);
    const authHeaderOut = authHeaderWithUserGetter(mockUserGetter);
    expect(authHeaderOut.authorization).toMatch(/testToken/);
  });
  test("Creates empty header if user has no token prop", () => {
    mockUserGetter.mockReturnValue({});
    const authHeaderOut = authHeaderWithUserGetter(mockUserGetter);
    expect(mockUserGetter).toHaveBeenCalledTimes(1);
    expect(authHeaderOut).toEqual({});
  });
});
