import { Path } from "types/path";
import { getBasePath, routerPath } from "utilities/pathUtilities";

describe("utilities/pathUtilities", () => {
  describe("getBasePath", () => {
    it("finds matching paths", () => {
      expect(getBasePath("/app/goals/current")).toBe(Path.GoalCurrent);
      expect(getBasePath("/password/reset/token")).toBe(Path.PwReset);
    });
    it("catches mismatched paths", () => {
      expect(getBasePath("/dev/null")).toBe(Path.Root);
    });
  });

  describe("routerPath", () => {
    it("returns relative paths for Route", () => {
      expect(routerPath(Path.Login)).toBe("login");
      expect(routerPath(Path.AppRoot)).toBe("app/*");
      expect(routerPath(Path.GoalCurrent)).toBe("goals/current");
    });
  });
});
