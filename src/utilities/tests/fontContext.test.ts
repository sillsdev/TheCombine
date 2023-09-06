import { newProject } from "types/project";
import { newWritingSystem } from "types/writingSystem";
import { ProjectFonts } from "utilities/fontContext";

const inherit = "inherit";

describe("ProjectFonts", () => {
  describe("constructor", () => {
    it("handles no project input", () => {
      const projFonts = new ProjectFonts();
      expect(projFonts.analysisFont === inherit);
      expect(projFonts.getLangFont("") === inherit);
      expect(projFonts.vernacularFont === inherit);
    });

    it("correctly defaults to 'inherit' for projects with no specified fonts", () => {
      const projFonts = new ProjectFonts(newProject());
      expect(projFonts.analysisFont === inherit);
      expect(projFonts.getLangFont("") === inherit);
      expect(projFonts.vernacularFont === inherit);
    });

    it("correctly sets fonts", () => {
      const aBcp = ["sns", "srf", "thr"];
      const aFont = ["Analysis Sans", "Analysis Serif", "Noto Other"];
      const vernFont = "Noto Sans Vern";

      const proj = newProject();
      proj.analysisWritingSystems = aBcp.map((bcp, i) =>
        newWritingSystem(bcp, `name${i}`, aFont[i])
      );
      proj.vernacularWritingSystem.font = vernFont;

      const projFonts = new ProjectFonts(proj);
      expect(projFonts.analysisFont === aFont[0].replaceAll(" ", ""));
      expect(projFonts.getLangFont("") === inherit);
      aBcp.forEach((bcp, i) => {
        expect(projFonts.getLangFont(bcp) === aFont[i].replaceAll(" ", ""));
      });
      expect(projFonts.getLangFont("not-a-lang-in-the-proj") === inherit);
      expect(projFonts.vernacularFont === vernFont.replaceAll(" ", ""));
    });
  });
});
