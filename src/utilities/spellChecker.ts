import nspell from "nspell";

import { Bcp47Code } from "types/writingSystem";
import dictionary from "utilities/dictionary";

export default class SpellChecker {
  private bcp47: Bcp47Code | undefined;
  private spell: nspell | undefined;

  constructor(lang?: string) {
    this.updateLang(lang);
  }

  async updateLang(lang?: string) {
    if (!lang) {
      this.bcp47 = undefined;
      return;
    }
    const bcp47 = lang.split("-")[0] as Bcp47Code;
    if (this.bcp47 === bcp47) {
      return;
    }

    this.bcp47 = bcp47;
    await dictionary(bcp47).then((result) => {
      if (result) {
        const { aff, dic } = result;
        this.spell = nspell(aff, dic);
        if (process.env.NODE_ENV === "development") {
          console.log(`Loaded spell-checker: ${bcp47}`);
        }
      }
    });
  }

  correct(word: string) {
    return this.spell?.correct(word);
  }

  // If the word string is multiple words (separated by spaces)
  // find spelling suggestions for the last word.
  getSpellingSuggestions(word: string): string[] {
    if (!this.spell) {
      return [];
    }

    // Remove excess whitespace
    const words = word
      .trim()
      .split(" ")
      .filter((w) => w);

    const final = words.pop();
    if (!final) {
      return [];
    }
    let suggestions = this.spell.suggest(final);
    if (suggestions.length && words.length) {
      const allButFinal = words.join(" ") + " ";
      suggestions = suggestions.map((w) => allButFinal + w);
    }
    return suggestions;
  }
}
