import { type Project } from "api/models";
import { newWritingSystem } from "types/writingSystem";
import { fetchCss, getCss, getProjCss } from "utilities/fontCssUtilities";

global.fetch = () =>
  Promise.resolve({
    blob: () => Promise.resolve({ text: mockFetchText }),
    ok: true,
  } as any as Response);
const mockFetchText = jest.fn();

describe("fontCssUtilities", () => {
  describe("fetchCss", () => {
    it("handles sources", async () => {
      const css = `@font{font-family: Font}`;
      mockFetchText.mockResolvedValue(css);
      expect(await fetchCss("font1", "local")).toEqual(css);
      expect(await fetchCss("font2", "google")).toEqual(css);
      expect(await fetchCss("font3", "not-a-source")).toBeUndefined();
    });

    it("substitutes", async () => {
      const font = "Before";
      const substitute = "After";
      const cssBefore = `@font{font-family: ${font}}`;
      const cssAfter = `@font{font-family: ${substitute}}`;
      mockFetchText.mockResolvedValueOnce(cssBefore);
      expect(await fetchCss(font, "local", substitute)).toEqual(cssAfter);
    });
  });

  describe("getCss", () => {
    it("doesn't get fallbacks if css data fetched", async () => {
      const css = "@started-with-at-sign{}";
      mockFetchText.mockResolvedValue(css);
      const cssStrings = await getCss(["font"]);
      expect(cssStrings).toHaveLength(1);
      expect(cssStrings).toContain(css);
      expect(mockFetchText).toHaveBeenCalledTimes(1);
    });

    it("get fallbacks if no css data fetched", async () => {
      mockFetchText.mockResolvedValueOnce(
        "<html>not-started-with-at-sign</html>"
      );
      mockFetchText.mockResolvedValueOnce('{"google": {}}');
      expect(await getCss(["font"])).toHaveLength(0);
      expect(mockFetchText).toHaveBeenCalledTimes(2);
    });
  });

  describe("getProjCss", () => {
    it("gets analysis and vern fonts, handling duplicates", async () => {
      mockFetchText.mockResolvedValue("@font{}");
      const proj: Partial<Project> = {
        analysisWritingSystems: [
          newWritingSystem("bcp1a", "name1a", "font1"),
          newWritingSystem("bcp2a", "name2a", "font2"),
          newWritingSystem("bcp2b", "name2b", "font2"),
          newWritingSystem("bcp1b", "name1b", "font1"),
          newWritingSystem("bcp2c", "name2c", "font2"),
        ],
        vernacularWritingSystem: newWritingSystem("bcp", "name", "font"),
      };
      expect(await getProjCss(proj as Project)).toHaveLength(3);
    });
  });
});
