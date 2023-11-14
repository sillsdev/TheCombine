import { CSSProperties, createContext } from "react";

import { Project } from "api/models";
import { Hash } from "types/hash";

export type WithFontProps = {
  analysis?: boolean;
  lang?: string;
  vernacular?: boolean;
};

export class ProjectFonts {
  readonly analysisDir: CSSProperties["direction"];
  readonly analysisFont: string;
  private readonly rtlLangs: Hash<boolean> = {};
  private readonly inherit = "inherit";
  private readonly langMap: Hash<string> = {};
  private readonly rtl = "rtl";
  readonly vernacularDir: CSSProperties["direction"];
  readonly vernacularFont: string;

  constructor(proj?: Project) {
    this.analysisFont = this.inherit;
    this.vernacularFont = this.inherit;
    if (!proj) {
      return;
    }

    proj.analysisWritingSystems.forEach((ws) => {
      const font = ws.font.replaceAll(" ", "");
      if (font && !(ws.bcp47 in this.langMap)) {
        this.langMap[ws.bcp47] = font;
        if (ws.rtl) {
          this.rtlLangs[ws.bcp47] = true;
        }
      }
    });

    if (proj.analysisWritingSystems.length) {
      const analysisWS = proj.analysisWritingSystems[0];
      this.analysisFont = analysisWS.font.replaceAll(" ", "") || this.inherit;
      if (analysisWS.rtl) {
        this.analysisDir = this.rtl;
      }
    }

    const vernFont = proj.vernacularWritingSystem.font.replaceAll(" ", "");
    if (vernFont) {
      this.vernacularFont = vernFont;
      this.langMap[proj.vernacularWritingSystem.bcp47] = vernFont;
      if (proj.vernacularWritingSystem.rtl) {
        this.rtlLangs[proj.vernacularWritingSystem.bcp47] = true;
        this.vernacularDir = this.rtl;
      }
    }
  }

  getLangDir(bcp47: string): CSSProperties["direction"] {
    if (bcp47 in this.rtlLangs) {
      return this.rtl;
    }
  }

  getLangFont(bcp47: string): string {
    if (bcp47 in this.langMap) {
      return this.langMap[bcp47] || this.inherit;
    }
    return this.inherit;
  }

  /**
   * Conditionally adds a fontFamily (and direction) to the style.
   * Precedence, from highest to lowest, moving to the next one if falsy:
   *   vernacular; lang; analysis; input style; "inherit" (direction undefined).
   */
  addFontToStyle(props: WithFontProps, style?: CSSProperties): CSSProperties {
    return {
      ...style,
      direction: props.vernacular
        ? this.vernacularDir
        : props.lang
          ? this.getLangDir(props.lang)
          : props.analysis
            ? this.analysisDir
            : style?.direction,
      fontFamily: props.vernacular
        ? this.vernacularFont
        : props.lang
          ? this.getLangFont(props.lang)
          : props.analysis
            ? this.analysisFont
            : style?.fontFamily ?? this.inherit,
    };
  }
}

const FontContext = createContext<ProjectFonts>(new ProjectFonts());

export default FontContext;
