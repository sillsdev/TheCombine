import {
  Definition,
  Flag,
  Gloss,
  GrammaticalInfo,
  SemanticDomain,
  Sense,
  Status,
  Word,
} from "api/models";
import { newSense, newWord } from "types/word";
import { cleanDefinitions, cleanGlosses } from "utilities/wordUtilities";

export enum ColumnId {
  Vernacular,
  Senses,
  Definitions,
  Glosses,
  PartOfSpeech,
  Domains,
  Pronunciations,
  Note,
  Flag,
  History,
  Delete,
}

// These must match the ReviewEntriesWord fields for use in ReviewEntriesTable
export enum ReviewEntriesWordField {
  Id = "id",
  Vernacular = "vernacular",
  Senses = "senses",
  Pronunciations = "audio",
  Note = "noteText",
  Flag = "flag",
}

export class ReviewEntriesWord {
  id: string;
  vernacular: string;
  senses: ReviewEntriesSense[];
  audio: string[];
  audioNew?: string[];
  noteText: string;
  flag: Flag;
  historyLength: number;
  protected: boolean;

  constructor(word?: Word, analysisLang?: string) {
    if (!word) {
      word = newWord();
    }
    this.id = word.id;
    this.vernacular = word.vernacular;
    this.senses = word.senses.map(
      (s) => new ReviewEntriesSense(s, analysisLang)
    );
    this.audio = word.audio;
    this.noteText = word.note.text;
    this.flag = word.flag;
    this.historyLength = word.history.length;
    this.protected = word.accessibility === Status.Protected;
  }
}

export class ReviewEntriesSense {
  guid: string;
  definitions: Definition[];
  glosses: Gloss[];
  partOfSpeech: GrammaticalInfo;
  domains: SemanticDomain[];
  deleted: boolean;
  protected: boolean;

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
