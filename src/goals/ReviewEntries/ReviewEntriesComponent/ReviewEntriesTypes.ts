import Recorder from "components/Pronunciations/Recorder";
import { Gloss, SemanticDomain, Sense, State, Word } from "types/word";

export class ReviewEntriesWord {
  id: string = "";
  vernacular: string = "";
  senses: ReviewEntriesSense[] = [];
  pronunciationFiles: string[] = [];
  noteText: string = "";
  recorder?: Recorder;
}

export function parseWord(
  word: Word,
  analysisLang?: string, // bcp47 code
  commonRecorder?: Recorder
) {
  const currentWord: ReviewEntriesWord = {
    id: word.id,
    vernacular: word.vernacular,
    senses: [],
    pronunciationFiles: word.audio,
    noteText: word.note.text,
    recorder: commonRecorder,
  };
  currentWord.senses = word.senses.map(
    (s) => new ReviewEntriesSense(s, analysisLang)
  );
  return currentWord;
}

export class ReviewEntriesSense {
  senseId: string = "";
  glosses: Gloss[] = [];
  domains: SemanticDomain[] = [];
  deleted: boolean = false;

  static OLD_SENSE = "-old";
  static SEPARATOR = ", ";

  constructor(sense: Sense, analysisLang?: string) {
    this.deleted = sense.accessibility === State.Deleted;
    this.senseId = sense.guid + ReviewEntriesSense.OLD_SENSE;
    this.domains = [...sense.semanticDomains];
    this.glosses = analysisLang
      ? sense.glosses.filter((g) => g.language === analysisLang)
      : [...sense.glosses];
  }

  static getGuid(sense: ReviewEntriesSense) {
    const id = sense.senseId;
    if (id.endsWith(ReviewEntriesSense.OLD_SENSE)) {
      return id.slice(0, -ReviewEntriesSense.OLD_SENSE.length);
    }
    return id;
  }
  static glossString(sense: ReviewEntriesSense): string {
    return sense.glosses.map((g) => g.def).join(ReviewEntriesSense.SEPARATOR);
  }
  static glossesFromString(glossString: string, language: string): Gloss[] {
    return glossString
      .split(ReviewEntriesSense.SEPARATOR.trim())
      .map((def) => ({ def: def.trim(), language }));
  }
}
