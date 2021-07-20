import {
  Definition,
  Gloss,
  SemanticDomain,
  Sense,
  State,
  Word,
} from "api/models";
import Recorder from "components/Pronunciations/Recorder";
import { cleanDefinitions, cleanGlosses, newSense, newWord } from "types/word";

export class ReviewEntriesWord {
  id: string;
  vernacular: string;
  senses: ReviewEntriesSense[];
  pronunciationFiles: string[];
  noteText: string;
  recorder?: Recorder;

  constructor(word?: Word, analysisLang?: string, commonRecorder?: Recorder) {
    if (!word) {
      word = newWord();
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
  definitions: Definition[];
  glosses: Gloss[];
  domains: SemanticDomain[];
  deleted: boolean;

  constructor(sense?: Sense, analysisLang?: string) {
    if (!sense) {
      sense = newSense();
    }
    this.guid = sense.guid;
    this.definitions = analysisLang
      ? sense.definitions.filter((d) => d.language === analysisLang)
      : sense.definitions;
    this.definitions = cleanDefinitions(this.definitions);
    this.glosses = analysisLang
      ? sense.glosses.filter((g) => g.language === analysisLang)
      : sense.glosses;
    this.glosses = cleanGlosses(this.glosses);
    this.domains = [...sense.semanticDomains];
    this.deleted = sense.accessibility === State.Deleted;
  }

  private static SEPARATOR = "; ";
  static definitionString(sense: ReviewEntriesSense): string {
    return sense.definitions
      .map((d) => d.text)
      .join(ReviewEntriesSense.SEPARATOR);
  }
  static glossString(sense: ReviewEntriesSense): string {
    return sense.glosses.map((g) => g.def).join(ReviewEntriesSense.SEPARATOR);
  }
}
