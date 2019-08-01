import aff from "../../resources/dictionaries/en-us.aff.ts";
import dictionary from "../../resources/dictionaries/en-us.dic.ts";

const nspell = require("nspell");

class SpellChecker {
  spell;

  constructor() {
    this.spell = nspell(aff, dictionary);
  }

  correct(word) {
    return this.spell.correct(word);
  }

  getSpellingSuggestions(word) {
    return this.spell.suggest(word);
  }
}

export default SpellChecker;
