import nspell from "nspell";

import { Bcp47Code } from "types/writingSystem";
import DictionaryLoader from "utilities/dictionaryLoader";

interface SplitWord {
  allButFinal?: string;
  final?: string;
}

const maxSuggestions = 5;

export default class SpellChecker {
  private bcp47: Bcp47Code | undefined;
  private dictLoader: DictionaryLoader | undefined;
  private dictLoaded: { [key: string]: string[] } = {};
  private spell: nspell | undefined;

  constructor(lang?: string) {
    this.updateLang(lang);
  }

  async updateLang(lang?: string): Promise<void> {
    if (!lang) {
      this.bcp47 = undefined;
      return;
    }
    const bcp47 = lang.split("-")[0] as Bcp47Code;
    if (this.bcp47 === bcp47) {
      return;
    }

    this.bcp47 = bcp47;
    this.dictLoader = new DictionaryLoader(bcp47);
    this.dictLoaded = {};
    await this.dictLoader.loadDictionary().then((dic) => {
      if (dic !== undefined) {
        this.spell = nspell("SET UTF-8", dic);
        this.addToDictLoaded(dic);
        if (process.env.NODE_ENV === "development") {
          console.log(`Loaded spell-checker: ${bcp47}`);
        }
      }
    });
  }

  // Given a word, load the dictionary part matching the start of the word.
  async load(word: string): Promise<void> {
    if (!word || !this.dictLoader || !this.bcp47 || !this.spell) {
      return;
    }

    const part = await this.dictLoader.loadDictPart(word);
    if (part) {
      this.addToDictLoaded(part);
      this.spell.personal(part);
    }
  }

  correct(word: string): boolean | undefined {
    return this.spell?.correct(word);
  }

  addToDictLoaded(entries: string): void {
    entries.split("\n").map((w) => {
      if (!(w[0] in this.dictLoaded)) {
        this.dictLoaded[w[0]] = [];
      }
      this.dictLoaded[w[0]].push(w);
    });
  }

  /** Trim whitespace from the start and non-letter/-mark/-number characters from the end,
   * then split off the final word. */
  static cleanAndSplit(word: string): SplitWord {
    // Use of \p{L}\p{M}\p{N} here matches that in split_dictionary.py.
    // Cf. https://en.wikipedia.org/wiki/Unicode_character_property
    word = word.trimStart().replace(/[^\p{L}\p{M}\p{N}]*$/u, "");
    if (!word) {
      return {};
    }
    // Split by non-letter/-mark/-number characters.
    const final = word.split(/[^\p{L}\p{M}\p{N}]/u).pop();
    if (!final) {
      // The above `.replace(...)` and `!word`-check make this impossible,
      // but it mollifies Typescript and is a good backstop for any future changes.
      return {};
    }
    const allButFinal = word.slice(0, word.length - final.length);
    return { allButFinal, final };
  }

  /** If the given string, split by separator (non-letter/-mark/-number) characters,
   * is multiple words, replace all but the last word with ellipses (...).
   * (Assumes all end-of-string separator characters have been removed,
   * which is the case for suggestions from this SpellChecker.) */
  public static replaceAllButLastWordWithEllipses(word: string): string {
    // Split by non-letter/-mark/-number characters
    const words = word.split(/[^\p{L}\p{M}\p{N}]/u).filter((w) => w);
    // Find the last non-letter/-mark/-number character
    const finalSep = word.match(/[^\p{L}\p{M}\p{N}]/gu)?.pop();
    return words.length > 1 ? `...${finalSep}${words[words.length - 1]}` : word;
  }

  // If the word string is multiple words, separate and
  // find spelling suggestions for the last word.
  getSpellingSuggestions(word: string): string[] {
    if (!this.spell || !word) {
      return [];
    }
    const { allButFinal, final } = SpellChecker.cleanAndSplit(word);
    if (!final) {
      return [];
    }

    // Don't await--just load for future use.
    this.load(final);

    // Get spelling suggestions.
    let suggestions = this.spell.suggest(final);

    // Add lookahead suggestions.
    if (this.dictLoaded[final[0]] && suggestions.length < maxSuggestions) {
      const lookahead = this.dictLoaded[final[0]].filter(
        (entry) =>
          entry.length >= final.length &&
          entry.substring(0, final.length) === final &&
          !suggestions.includes(entry)
      );
      suggestions.push(...lookahead.sort());
    }

    // Limit to maxSuggestions.
    if (suggestions.length > maxSuggestions) {
      suggestions = suggestions.slice(0, maxSuggestions);
    }

    // Prepend the start of the typed phrase, if any.
    if (suggestions.length && allButFinal) {
      suggestions = suggestions.map((w) => allButFinal + w);
    }

    return suggestions;
  }
}
