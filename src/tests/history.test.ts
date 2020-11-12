import { getBasePath, path } from "../history";

describe("history", () => {
  describe("getBasePath", () => {
    it("returns path.goal for a specific numbered goal", () => {
      expect(getBasePath(`${path.goals}/3`)).toEqual(path.goals);
    });

    it("returns path.root as the default", () => {
      expect(getBasePath("")).toEqual(path.root);
      expect(getBasePath("d3finitely/n0t/a/real/path/")).toEqual(path.root);
    });
  });
});
