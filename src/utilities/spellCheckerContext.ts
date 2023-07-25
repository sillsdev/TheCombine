import { createContext } from "react";

import SpellChecker from "utilities/spellChecker";

const SpellCheckerContext = createContext(new SpellChecker());

export default SpellCheckerContext;
