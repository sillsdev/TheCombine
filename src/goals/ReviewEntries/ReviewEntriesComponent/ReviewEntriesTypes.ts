import { SemanticDomain, Sense, Word, State } from "../../../types/word";
import { uuid } from "../../../utilities";
import { Recorder } from "../../../components/Pronunciations/Recorder";

export const OLD_SENSE: string = "-old";
export const SEP_CHAR: string = ",";
const SEPARATOR: string = SEP_CHAR + " ";

export interface ReviewEntriesWord {
  id: string;
  vernacular: string;
  senses: ReviewEntriesSense[];
  pronunciationFiles: string[];
  recorder?: Recorder;
}
export interface ReviewEntriesSense {
  senseId: string;
  glosses: string;
  domains: SemanticDomain[];
  deleted: boolean;
}

export function parseWord(
  word: Word,
  analysisLang: string,
  commonRecorder?: Recorder
) {
  let currentWord: ReviewEntriesWord = {
    id: word.id,
    vernacular: word.vernacular,
    senses: [],
    pronunciationFiles: word.audio,
    recorder: commonRecorder,
  };

  for (let sense of word.senses) {
    currentWord.senses.push(parseSense(sense, analysisLang));
  }
  return currentWord;
}
// Convert a Sense into a ReviewEntriesSense
function parseSense(sense: Sense, analysisLang: string) {
  let hasGloss: boolean;
  let currentSense: ReviewEntriesSense = {
    glosses: "",
    domains: [],
    deleted:
      sense.accessibility !== undefined &&
      sense.accessibility === State.deleted,
    senseId: uuid() + OLD_SENSE,
  };

  // Add domains
  if (sense.semanticDomains)
    currentSense = {
      ...currentSense,
      domains: [...sense.semanticDomains],
    };

  // Find all glosses in the current language
  hasGloss = false;
  if (sense.glosses)
    for (let gloss of sense.glosses)
      if (gloss.language === analysisLang) {
        hasGloss = true;
        currentSense.glosses += gloss.def + SEPARATOR;
      }

  // Format the glosses + push them
  if (hasGloss)
    currentSense.glosses = currentSense.glosses.slice(0, -SEPARATOR.length);
  else currentSense.glosses = "";

  return currentSense;
}
