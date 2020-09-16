import nspell from "nspell";

import { aff, dic } from "../../resources/dictionaries";

class SpellChecker {
  spell: nspell;

  constructor(analysisLang = "en") {
    switch (analysisLang.split("-")[0]) {
      case "es":
        this.spell = nspell(aff.es, dic.es);
        break;
      case "fr":
        this.spell = nspell(aff.fr, dic.fr);
        break;
      default:
        this.spell = nspell(aff.en, dic.en);
    }
  }

  correct(word: string) {
    return this.spell.correct(word);
  }

  getSpellingSuggestions(word: string) {
    return this.spell.suggest(word);
  }
}

export default SpellChecker;
