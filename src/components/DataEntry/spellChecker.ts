import nspell from "nspell";

import aff from "../../resources/dictionaries/en-us.aff";
import dictionary from "../../resources/dictionaries/en-us.dic";

class SpellChecker {
  spell: nspell;

  constructor() {
    this.spell = nspell(aff, dictionary);
  }

  correct(word: string) {
    return this.spell.correct(word);
  }

  getSpellingSuggestions(word: string) {
    return this.spell.suggest(word);
  }
}

export default SpellChecker;
