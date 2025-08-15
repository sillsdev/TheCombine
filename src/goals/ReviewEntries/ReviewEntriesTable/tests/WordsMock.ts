import { GramCatGroup, type Sense, type Word } from "api/models";
import { newSemanticDomain } from "types/semanticDomain";
import {
  newDefinition,
  newFlag,
  newNote,
  newPronunciation,
  newSense,
  newWord,
} from "types/word";

// Define senses for count sorted order [1, 0, 2, 3]
// and for gloss sorted order [0, 1, 3, 2]
const senses: Sense[][] = [
  [newSense("Echo"), newSense("E2")],
  [newSense("Foxtrot")],
  [newSense("Hotel"), newSense("H2"), newSense("H3")],
  [newSense("Golf"), newSense("G2"), newSense("G3"), newSense("G4")],
];

// Define sense grammatical info for sorted order [1, 2, 0, 3]
senses[1][0].grammaticalInfo.catGroup = GramCatGroup.Noun;
senses[1][0].grammaticalInfo.grammaticalCategory = "a";
senses[2][0].grammaticalInfo.catGroup = GramCatGroup.Noun;
senses[2][0].grammaticalInfo.grammaticalCategory = "b";
senses[2][1].grammaticalInfo.catGroup = GramCatGroup.Adverb;
senses[0][0].grammaticalInfo.catGroup = GramCatGroup.Noun;
senses[0][0].grammaticalInfo.grammaticalCategory = "b";
senses[0][1].grammaticalInfo.catGroup = GramCatGroup.Verb;
// (leave senses[3] grammatical info Unspecified)

// Define sense definitions for sorted order [2, 0, 3, 1]
// (leave senses[2] definitions empty)
// (give senses[0] concatenated definition "a")
senses[0][1].definitions = [newDefinition("a", "a")];
// (give senses[3] concatenated definition "b; c")
senses[3][0].definitions.push(newDefinition("", "e"), newDefinition("b", "b"));
senses[3][3].definitions.push(newDefinition("c", "c"));
// (give senses[1] concatenated definition "b; d")
senses[1][0].definitions.push(newDefinition("b", "b"), newDefinition("d", "d"));

// Define semantic domains for sorted order [2, 3, 0, 1]
// (give senses[2] domains with id "1", "2", "9")
senses[2][1].semanticDomains.push(newSemanticDomain("9"));
senses[2][1].semanticDomains.push(newSemanticDomain("2"));
senses[2][2].semanticDomains.push(newSemanticDomain("1"));
// (give senses[3] domains with id "1", "4")
senses[3][1].semanticDomains.push(newSemanticDomain("4"));
senses[3][1].semanticDomains.push(newSemanticDomain("1"));
// (give senses[3] domain with id "3")
senses[0][0].semanticDomains.push(newSemanticDomain("3"));
// (leave senses[1] without semantic domains)

export const verns = ["Alfa", "Delta", "Bravo", "Charlie"];

// Defined words for vernaculars sorted order [0, 2, 3, 1]
// and for pronunciations sorted order [3, 2, 1, 0]
// and for flags sorted order [1, 0, 3, 2]
// and for notes sorted order [0, 3, 2, 1]
/** Returns an array of 4 words specially designed to test every column's `sortingFn`. */
export function mockWords(): Word[] {
  return [
    {
      ...newWord(verns[0]),
      audio: [newPronunciation(), newPronunciation(), newPronunciation()],
      flag: newFlag("India"),
      id: "0",
      note: newNote("Kilo"),
      senses: senses[0],
    },
    {
      ...newWord(verns[1]),
      audio: [newPronunciation(), newPronunciation()],
      flag: { active: true, text: "" }, // (active flag with empty text is sorted to first)
      id: "1",
      // (empty note text is sorted to last)
      senses: senses[1],
    },
    {
      ...newWord(verns[2]),
      audio: [newPronunciation()],
      // (flag with `active = false` is sorted to last)
      id: "2",
      note: newNote("Mike"),
      senses: senses[2],
    },
    {
      ...newWord(verns[3]),
      flag: newFlag("Juliett"),
      id: "3",
      note: newNote("Lima"),
      senses: senses[3],
    },
  ];
}

/** `sortOrder[i]` gives the order of `mockWords()` when sorted by column `i`. */
export const sortOrder = [
  [0, 2, 3, 1], // Vernacular (alphabetical)
  [1, 0, 2, 3], // Senses (count)
  [2, 0, 3, 1], // Definitions (concatenated, alphabetical)
  [0, 1, 3, 2], // Glosses (concatenated, alphabetical)
  [1, 2, 0, 3], // PartOfSpeech (compare sense-by-sense)
  [2, 3, 0, 1], // Domains (compare ids across all senses, with none last)
  [3, 2, 1, 0], // Pronunciations (count)
  [0, 3, 2, 1], // Note (text, alphabetical, with empty last)
  [1, 0, 3, 2], // Flag (text, alphabetical, with active=false last)
];
