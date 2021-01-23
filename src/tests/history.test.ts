import { getBasePath, Path } from "browserHistory";

describe("history", () => {
  describe("getBasePath", () => {
    it("returns Path.Goal for a specific numbered goal", () => {
      expect(getBasePath(`${Path.Goals}/3`)).toEqual(Path.Goals);
    });

    it("returns Path.Root as the default", () => {
      expect(getBasePath("")).toEqual(Path.Root);
      expect(getBasePath("d3finitely/n0t/a/real/path/")).toEqual(Path.Root);
    });
  });
});
