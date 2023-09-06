import { CSSProperties, createContext } from "react";

import { Project } from "api/models";
import { Hash } from "types/hash";

export type WithFontProps = {
  analysis?: boolean;
  lang?: string;
  vernacular?: boolean;
};

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

  /**
   * Conditionally adds a fontFamily to the style.
   * Precedence, from highest to lowest, moving to the next one if falsy:
   *   vernacular;
   *   lang;
   *   analysis;
   *   fontFamily of input style;
   *   "inherit".
   */
  addFontToStyle(props: WithFontProps, style?: CSSProperties): CSSProperties {
    return {
      ...style,
      fontFamily: props.vernacular
        ? this.vernacularFont
        : props.lang
        ? this.getLangFont(props.lang)
        : props.analysis
        ? this.analysisFont
        : style?.fontFamily ?? "inherit",
    };
  }
}

const FontContext = createContext<ProjectFonts>(new ProjectFonts());

export default FontContext;
