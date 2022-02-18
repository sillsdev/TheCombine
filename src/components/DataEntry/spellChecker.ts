import nspell from "nspell";

import { aff, dic } from "resources/dictionaries";
import { defaultWritingSystem, langCode } from "types/project";

class SpellChecker {
  spell: nspell;

  constructor(analysisLang = defaultWritingSystem.bcp47) {
    switch (analysisLang.split("-")[0]) {
      case langCode.Es:
        this.spell = nspell(aff.es, dic.es);
        break;
      case langCode.Fr:
        this.spell = nspell(aff.fr, dic.fr);
        break;
      default:
        this.spell = nspell(aff.en, dic.en);
        break;
    }
  }

  correct(word: string) {
    return this.spell.correct(word);
  }

  // If the word string is multiple words (separated by spaces)
  // find spelling suggestions for the last word.
  getSpellingSuggestions(word: string): string[] {
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
    if (words.length) {
      const allButFinal = words.join(" ") + " ";
      suggestions = suggestions.map((w) => allButFinal + w);
    }
    return suggestions;
  }
}

export default SpellChecker;
