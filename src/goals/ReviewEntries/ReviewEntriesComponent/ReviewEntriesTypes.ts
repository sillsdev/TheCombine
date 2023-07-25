import {
  Definition,
  Flag,
  Gloss,
  GrammaticalInfo,
  SemanticDomain,
  Sense,
  Status,
  Word,
  WritingSystem,
} from "api/models";
import { newSense, newWord } from "types/word";
import { cleanDefinitions, cleanGlosses } from "utilities/wordUtilities";

// These must match the ReviewEntriesWord fields for use in ReviewEntriesTable
export enum ReviewEntriesWordField {
  Id = "id",
  Vernacular = "vernacular",
  Senses = "senses",
  Pronunciations = "pronunciationFiles",
  Note = "noteText",
  Flag = "flag",
}

export class ReviewEntriesWord {
  id: string;
  vernacular: string;
  senses: ReviewEntriesSense[];
  pronunciationFiles: string[];
  noteText: string;
  flag: Flag;
  protected: boolean;

  constructor(
    word?: Word,
    analysisLang?: string,
    writingSystems?: WritingSystem[]
  ) {
    if (!word) {
      word = newWord();
    }
    this.id = word.id;
    this.vernacular = word.vernacular;
    this.senses = word.senses.map(
      (s) => new ReviewEntriesSense(s, analysisLang, writingSystems)
    );
    this.pronunciationFiles = word.audio;
    this.noteText = word.note.text;
    this.flag = word.flag;
    this.protected = word.accessibility === Status.Protected;
  }
}

export class ReviewEntriesSense {
  guid: string;
  definitions: Definition[];
  glosses: ReviewEntriesGloss[];
  partOfSpeech: GrammaticalInfo;
  domains: SemanticDomain[];
  deleted: boolean;
  protected: boolean;

  constructor(
    sense?: Sense,
    analysisLang?: string,
    writingSystems?: WritingSystem[]
  ) {
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
    if (writingSystems) {
      this.glosses = this.glosses.map(
        (g) => new ReviewEntriesGloss(g.def, g.language, writingSystems)
      );
    }
    this.partOfSpeech = sense.grammaticalInfo;
    this.domains = [...sense.semanticDomains];
    this.deleted = sense.accessibility === Status.Deleted;
    this.protected = sense.accessibility === Status.Protected;
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

export class ReviewEntriesGloss implements Gloss {
  def: string;
  language: string;
  font?: string;

  constructor(def = "", language = "", writingSystems?: WritingSystem[]) {
    this.def = def;
    this.language = language;
    const writingSystem = writingSystems?.find((ws) => ws.bcp47 === language);
    if (writingSystem) {
      console.info(writingSystems);
      this.font = writingSystem.font;
    }
  }
}
