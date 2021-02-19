import Recorder from "components/Pronunciations/Recorder";
import { Gloss, SemanticDomain, Sense, State, Word } from "types/word";

export class ReviewEntriesWord {
  id: string;
  vernacular: string;
  senses: ReviewEntriesSense[];
  pronunciationFiles: string[];
  noteText: string;
  recorder?: Recorder;

  constructor(word?: Word, analysisLang?: string, commonRecorder?: Recorder) {
    if (!word) {
      word = new Word();
    }
    this.id = word.id;
    this.vernacular = word.vernacular;
    this.senses = word.senses.map(
      (s) => new ReviewEntriesSense(s, analysisLang)
    );
    this.pronunciationFiles = word.audio;
    this.noteText = word.note.text;
    this.recorder = commonRecorder;
  }
}

export class ReviewEntriesSense {
  guid: string;
  glosses: Gloss[];
  domains: SemanticDomain[];
  deleted: boolean;

  constructor(sense?: Sense, analysisLang?: string) {
    if (!sense) {
      sense = new Sense();
    }
    this.guid = sense.guid;
    this.glosses = analysisLang
      ? sense.glosses.filter((g) => g.language === analysisLang)
      : [...sense.glosses];
    this.domains = [...sense.semanticDomains];
    this.deleted = sense.accessibility === State.Deleted;
  }

  private static SEPARATOR = ", ";
  static glossString(sense: ReviewEntriesSense): string {
    return sense.glosses.map((g) => g.def).join(ReviewEntriesSense.SEPARATOR);
  }
  static glossesFromString(glossString: string, language: string): Gloss[] {
    return glossString
      .split(ReviewEntriesSense.SEPARATOR.trim())
      .map((def) => ({ def: def.trim(), language }));
  }
}
