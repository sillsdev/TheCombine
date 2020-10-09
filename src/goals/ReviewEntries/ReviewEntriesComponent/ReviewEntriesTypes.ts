import Recorder from "../../../components/Pronunciations/Recorder";
import { SemanticDomain, Sense, State, Word } from "../../../types/word";
import { uuid } from "../../../utilities";

export const OLD_SENSE: string = "-old";
export const SEP_CHAR: string = ",";
const SEPARATOR: string = SEP_CHAR + " ";

export class ReviewEntriesWord {
  id: string = "";
  vernacular: string = "";
  senses: ReviewEntriesSense[] = [];
  pronunciationFiles: string[] = [];
  noteText: string = "";
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
  analysisLang: string, // bcp47 code
  commonRecorder?: Recorder
) {
  let currentWord: ReviewEntriesWord = {
    id: word.id,
    vernacular: word.vernacular,
    senses: [],
    pronunciationFiles: word.audio,
    noteText: word.note.text,
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
    deleted: sense.accessibility === State.Deleted,
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
