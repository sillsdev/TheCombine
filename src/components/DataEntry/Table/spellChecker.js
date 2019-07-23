"use strict";

const nspell = require("nspell");
const aff = require("../../../resources/dictionaries/en-us.aff");
const dictionary = require("../../../resources/dictionaries/en-us.dic");

class SpellChecker {
  constructor() {
    var spell = nspell(aff, dictionary);
    // spell.add("color");

    console.log(spell.suggest("colour"));
    console.log(spell.correct("colour"));
    console.log(spell.correct("Communist"));
  }

  correct(word) {
    return spell.suggest(word);
  }
}

export default SpellChecker;
