import { createContext } from "react";

import { Project } from "api/models";
import { Hash } from "types/hash";

export class ProjectFonts {
  readonly analysisFont: string;
  private readonly inherit = "inherit";
  private readonly langMap: Hash<string> = {};
  readonly vernacularFont: string;

  constructor(proj?: Project) {
    this.analysisFont = this.inherit;
    this.vernacularFont = this.inherit;
    if (!proj) {
      return;
    }

    proj.analysisWritingSystems.reverse().forEach((ws) => {
      const font = ws.font.replaceAll(" ", "");
      if (font) {
        this.langMap[ws.bcp47] = font;
      }
    });

    if (proj.analysisWritingSystems.length) {
      this.analysisFont =
        proj.analysisWritingSystems[0].font.replaceAll(" ", "") || this.inherit;
    }

    const vernFont = proj.vernacularWritingSystem.font.replaceAll(" ", "");
    if (vernFont) {
      this.vernacularFont = vernFont;
      this.langMap[proj.vernacularWritingSystem.bcp47] = vernFont;
    }
  }

  getLangFont(bcp47: string): string {
    if (bcp47 in this.langMap) {
      return this.langMap[bcp47] || this.inherit;
    }
    return this.inherit;
  }
}

const FontContext = createContext<ProjectFonts>(new ProjectFonts());

export default FontContext;
