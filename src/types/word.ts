import { v4 } from "uuid";

import {
  Definition,
  Flag,
  Gloss,
  GramCatGroup,
  GrammaticalInfo,
  Note,
  Pronunciation,
  SemanticDomain,
  Sense,
  Status,
  Word,
} from "api/models";
import { compareDomains } from "types/semanticDomain";
import { randomIntString } from "utilities/utilities";

export interface FileWithSpeakerId extends File {
  speakerId?: string;
}

export function newPronunciation(fileName = "", speakerId = ""): Pronunciation {
  return { fileName, speakerId, protected: false };
}

/** Returns a copy of the audio array with every entry updated that has:
 * - .protected false;
 * - same .fileName as the update pronunciation; and
 * - different .speakerId than the update pronunciation.
 *
 * Returns undefined if no such entry in the array. */
export function updateSpeakerInAudio(
  audio: Pronunciation[],
  update: Pronunciation
): Pronunciation[] | undefined {
  const updatePredicate = (p: Pronunciation): boolean =>
    !p.protected &&
    p.fileName === update.fileName &&
    p.speakerId !== update.speakerId;
  if (audio.findIndex(updatePredicate) === -1) {
    return;
  }
  return audio.map((a) => (updatePredicate(a) ? update : a));
}

export function newDefinition(text = "", language = ""): Definition {
  return { text, language };
}

export function newGloss(def = "", language = ""): Gloss {
  return { def, language };
}

const SEPARATOR = "; ";
function definitionString(s: Sense): string {
  return s.definitions.map((d) => d.text.trim()).join(SEPARATOR);
}
function glossString(s: Sense): string {
  return s.glosses.map((g) => g.def.trim()).join(SEPARATOR);
}

export function newSense(
  gloss?: string,
  lang?: string,
  semDom?: SemanticDomain
): Sense {
  const sense: Sense = {
    guid: v4(),
    definitions: [],
    glosses: [],
    semanticDomains: [],
    accessibility: Status.Active,
    grammaticalInfo: newGrammaticalInfo(),
  };
  if (gloss) {
    sense.glosses.push(newGloss(gloss, lang));
  }
  if (semDom) {
    sense.semanticDomains.push(semDom);
  }
  return sense;
}

export function newFlag(text = ""): Flag {
  return { active: !!text, text };
}

export function newNote(text = "", language = ""): Note {
  return { text, language };
}

export function newGrammaticalInfo(): GrammaticalInfo {
  return { catGroup: GramCatGroup.Unspecified, grammaticalCategory: "" };
}

export function compareGrammaticalInfo(
  a: GrammaticalInfo,
  b: GrammaticalInfo
): number {
  if (a.catGroup === b.catGroup) {
    return a.grammaticalCategory.localeCompare(b.grammaticalCategory);
  }

  if (a.catGroup === GramCatGroup.Unspecified) {
    return 1;
  }
  if (b.catGroup === GramCatGroup.Unspecified) {
    return -1;
  }
  return a.catGroup.localeCompare(b.catGroup);
}

export function newWord(vernacular = "", lang?: string): Word {
  return {
    id: "",
    guid: v4(),
    vernacular,
    senses: [],
    audio: [],
    created: "",
    modified: "",
    accessibility: Status.Active,
    history: [],
    projectId: "",
    note: newNote(undefined, lang),
    flag: newFlag(),
  };
}

/** A stripped-down sense used in DataEntry > ExistingDataTable. */
export class DomainWord {
  wordGuid: string;
  vernacular: string;
  senseGuid: string;
  glosses: Gloss[];

  constructor(word: Word, senseIndex = 0) {
    const sense = word.senses[senseIndex] ?? newSense();
    this.wordGuid = word.guid;
    this.vernacular = word.vernacular;
    this.senseGuid = sense.guid;
    this.glosses = sense.glosses;
  }
}

export function simpleWord(vern: string, gloss: string, lang?: string): Word {
  return {
    ...newWord(vern, lang),
    id: randomIntString(),
    senses: [newSense(gloss, lang)],
  };
}

export function multiSenseWord(vern: string, glosses: string[]): Word {
  return {
    ...newWord(vern),
    id: randomIntString(),
    senses: glosses.map((gloss) => newSense(gloss)),
  };
}

export function testWordList(): Word[] {
  return [
    { ...simpleWord("NoSense", ""), senses: [] },
    simpleWord("Yoink", "Hello"),
    simpleWord("Yode", "Goodbye"),
    simpleWord("Yoff", "Yes"),
    simpleWord("Yank", "No"),
    simpleWord("Yank", "Please help me"),
    simpleWord("Ya", "Help"),
    simpleWord("Yeet", "Please"),
    simpleWord("Yeet", "Mandatory"),
    simpleWord("Yang", "Die"),
    multiSenseWord("Yuino", ["Love", "Boba Fett", "Life"]),
    multiSenseWord("Yuilo", ["Sadness", "Tree bark"]),
    simpleWord("Yes", "Wumbo"),
    simpleWord("Yes", "Mayonnaise"),
  ];
}

export function compareSenseDomains(a: Sense, b: Sense): number {
  const aLen = a.semanticDomains.length;
  const bLen = b.semanticDomains.length;
  let compare = 0;

  // Special case: no domains
  if (!aLen || !bLen) {
    return bLen - aLen;
  }

  // Compare the domains
  for (let i = 0; compare === 0 && i < aLen && i < bLen; i++) {
    compare = compareDomains(a.semanticDomains[i], b.semanticDomains[i]);
  }

  return compare;
}

export function compareWordDomains(a: Word, b: Word): number {
  const aLen = a.senses.length;
  const bLen = b.senses.length;

  // Special case: no domains
  if (!aLen || !bLen) {
    return bLen - aLen;
  }

  // Compare the senses
  let compare = 0;
  for (let i = 0; compare === 0 && i < aLen && i < bLen; i++) {
    compare = compareSenseDomains(a.senses[i], b.senses[i]);
  }
  return compare;
}

export function compareWordDefinitions(a: Word, b: Word): number {
  for (let i = 0; i < a.senses.length && i < b.senses.length; i++) {
    const stringA = definitionString(a.senses[i]);
    const stringB = definitionString(b.senses[i]);
    if (stringA !== stringB) {
      return stringA.localeCompare(stringB);
    }
  }
  return a.senses.length - b.senses.length;
}
export function compareWordGlosses(a: Word, b: Word): number {
  for (let i = 0; i < a.senses.length && i < b.senses.length; i++) {
    const stringA = glossString(a.senses[i]);
    const stringB = glossString(b.senses[i]);
    if (stringA !== stringB) {
      return stringA.localeCompare(stringB);
    }
  }
  return a.senses.length - b.senses.length;
}

export function compareWordGrammaticalInfo(a: Word, b: Word): number {
  for (let i = 0; i < a.senses.length && i < b.senses.length; i++) {
    const compare = compareGrammaticalInfo(
      a.senses[i].grammaticalInfo,
      b.senses[i].grammaticalInfo
    );
    if (compare) {
      return compare;
    }
  }
  return a.senses.length - b.senses.length;
}
