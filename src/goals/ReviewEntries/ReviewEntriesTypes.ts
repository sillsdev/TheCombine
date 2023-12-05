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
import { Goal, GoalName, GoalType } from "types/goals";
import { newNote, newSense, newWord } from "types/word";
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

export class ReviewEntries extends Goal {
  constructor() {
    super(GoalType.ReviewEntries, GoalName.ReviewEntries);
  }
}

export type EntryEdit = {
  newId: string;
  oldId: string;
};

export interface EntriesEdited {
  entryEdits: EntryEdit[];
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

  /** Construct a ReviewEntriesWord from a Word.
   * Important: Some things (e.g., note language) aren't preserved! */
  constructor(word?: Word, analysisLang?: string) {
    word ??= newWord();
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

  /** Construct a ReviewEntriesSense from a Sense.
   * Important: Some things aren't preserved!
   * (E.g., distinct glosses with the same language are combined.) */
  constructor(sense?: Sense, analysisLang?: string) {
    sense ??= newSense();
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

/** Reverse map of the ReviewEntriesSense constructor.
 * Important: Some things aren't preserved!
 * (E.g., distinct glosses with the same language may have been combined.) */
function senseFromReviewEntriesSense(revSense: ReviewEntriesSense): Sense {
  return {
    ...newSense(),
    accessibility: revSense.protected
      ? Status.Protected
      : revSense.deleted
        ? Status.Deleted
        : Status.Active,
    definitions: revSense.definitions.map((d) => ({ ...d })),
    glosses: revSense.glosses.map((g) => ({ ...g })),
    grammaticalInfo: revSense.partOfSpeech,
    guid: revSense.guid,
    semanticDomains: revSense.domains.map((dom) => ({ ...dom })),
  };
}

/** Reverse map of the ReviewEntriesWord constructor.
 * Important: Some things (e.g., note language) aren't preserved! */
export function wordFromReviewEntriesWord(revWord: ReviewEntriesWord): Word {
  return {
    ...newWord(revWord.vernacular),
    accessibility: revWord.protected ? Status.Protected : Status.Active,
    audio: [...revWord.audio],
    id: revWord.id,
    flag: { ...revWord.flag },
    note: newNote(revWord.noteText),
    senses: revWord.senses.map(senseFromReviewEntriesSense),
  };
}
