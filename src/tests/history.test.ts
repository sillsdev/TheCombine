import { getBasePath, Path } from "../history";

describe("history", () => {
  describe("getBasePath", () => {
    it("returns Path.goal for a specific numbered goal", () => {
      expect(getBasePath(`${Path.goals}/3`)).toEqual(Path.goals);
    });

    it("returns Path.root as the default", () => {
      expect(getBasePath("")).toEqual(Path.root);
      expect(getBasePath("d3finitely/n0t/a/real/path/")).toEqual(Path.root);
    });
  });
});
