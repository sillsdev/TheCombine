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

export function newWord(vernacular = ""): Word {
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
    note: newNote(),
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

export function simpleWord(vern: string, gloss: string): Word {
  return {
    ...newWord(vern),
    id: randomIntString(),
    senses: [newSense(gloss)],
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
