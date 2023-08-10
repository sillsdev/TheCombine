import nspell from "nspell";

import { Bcp47Code } from "types/writingSystem";
import dictionary from "utilities/dictionary";

export default class SpellChecker {
  private bcp47: Bcp47Code | undefined;
  private loaded: string[];
  private spell: nspell | undefined;

  constructor(lang?: string) {
    this.loaded = [];
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

  async load(start: string): Promise<void> {
    if (!start || !this.spell || !this.bcp47) {
      return;
    }
    start = start.toLocaleLowerCase();
    const { dic, exc } = await dictionary(this.bcp47, start, this.loaded);
    if (exc && !this.loaded.includes(exc)) {
      this.loaded.push(exc);
    }
    if (dic) {
      console.info(`Loading new dictionary part: ${start}`);
      this.spell.personal(dic);
    }
  }

  correct(word: string): boolean | undefined {
    return this.spell?.correct(word);
  }

  // If the word string is multiple words (separated by spaces)
  // find spelling suggestions for the last word.
  getSpellingSuggestions(word: string): string[] {
    if (!this.spell || !word) {
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

    this.load(final);

    let suggestions = this.spell.suggest(final);
    if (!suggestions.length) {
      // Extend the current word to get suggestions 1 or 2 characters longer.
      suggestions = this.spell.suggest(`${final}..`);
    }

    if (suggestions.length && words.length) {
      const allButFinal = words.join(" ") + " ";
      suggestions = suggestions.map((w) => allButFinal + w);
    }
    return suggestions;
  }
}
