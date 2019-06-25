//Sam Delaney, 6/12/19

import DupFinder, { ScoredWord } from "../DuplicateFinder";
import { Word, simpleWord, makeSense } from "../../../../types/word";

describe("dupFinder Tests", () => {
  let Finder = new DupFinder();

  //TEST UTILITIES

  //put here instead of importing because testWordList will eventually be removed from types/word.
  let testWordList: Word[] = [
    simpleWord("Yoink", "Hello"),
    simpleWord("Yode", "Goodbye"),
    simpleWord("Yoff", "Yes"),
    simpleWord("Yank", "No"),
    simpleWord("Ya", "Help"),
    simpleWord("Yeet", "Please"),
    simpleWord("Yeet", "Mandatory"),
    simpleWord("Yang", "Die"),
    simpleWord("Yank", "Please god help me"),
    simpleWord("Yuino", "Love"),
    simpleWord("Yuino", "Boba Fett"),
    simpleWord("Yes", "Wumbo"),
    simpleWord("Yes", "Mayonnaise")
  ];

  let scoredYank: ScoredWord[] = [
    {
      word: {
        id: "6212061",
        vernacular: "Yank",
        senses: [makeSense("No")],
        audio: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: "",
        plural: ""
      },
      score: 0
    },
    {
      word: {
        id: "7518701",
        vernacular: "Yang",
        senses: [makeSense("Die")],
        audio: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: "",
        plural: ""
      },
      score: 1.25
    },
    {
      word: {
        id: "921780",
        vernacular: "Yank",
        senses: [makeSense("Please god help me")],
        audio: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: "",
        plural: ""
      },
      score: 0
    }
  ];
  let orderedYank: ScoredWord[] = [
    {
      word: {
        id: "6212061",
        vernacular: "Yank",
        senses: [makeSense("No")],
        audio: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: "",
        plural: ""
      },
      score: 0
    },
    {
      word: {
        id: "921780",
        vernacular: "Yank",
        senses: [makeSense("Please god help me")],
        audio: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: "",
        plural: ""
      },
      score: 0
    },
    {
      word: {
        id: "7518701",
        vernacular: "Yang",
        senses: [makeSense("Die")],
        audio: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: "",
        plural: ""
      },
      score: 1.25
    }
  ];
  let acceptedYank: Word[] = [
    {
      id: "921780",
      vernacular: "Yank",
      senses: [makeSense("Please god help me")],
      audio: "",
      created: "now",
      modified: "",
      history: [],
      partOfSpeech: "",
      editedBy: [],
      accessability: 0,
      otherField: "",
      plural: ""
    },
    {
      id: "6212061",
      vernacular: "Yank",
      senses: [makeSense("No")],
      audio: "",
      created: "now",
      modified: "",
      history: [],
      partOfSpeech: "",
      editedBy: [],
      accessability: 0,
      otherField: "",
      plural: ""
    },
    {
      id: "7518701",
      vernacular: "Yang",
      senses: [makeSense("Die")],
      audio: "",
      created: "now",
      modified: "",
      history: [],
      partOfSpeech: "",
      editedBy: [],
      accessability: 0,
      otherField: "",
      plural: ""
    }
  ];

  //placeholder for now (dependent on getWordsFromDB)
  test("test getNextDups", () => {});
  //placeholder for now
  test("test getWordsFromDB", () => {});

  //test that getDupsFromWordList properly strings together scoring and accepting
  test("test getDupsFromWordList", () => {
    let testOutput = Finder.getDupsFromWordList(testWordList[3], testWordList);
    for (let i = 0; i < testOutput[0].length; i++) {
      expect(testOutput[0][i].vernacular).toEqual(acceptedYank[i].vernacular);
      expect(testOutput[0][i].senses[0]).toEqual(acceptedYank[i].senses[0]);
    }
  });

  test("test filter", () => {
    let testWords = testWordList;
    let filteredwords = Finder.filter(testWords[0], testWords);

    filteredwords.forEach(word => {
      expect(
        Math.abs(word.vernacular.length - testWords[0].vernacular.length)
      ).toBeLessThan(2);
    });
  });

  //test that getAcceptedWords properly strings together sorting and converting to Word
  test("test getAcceptedWords", () => {
    let testOutput = Finder.getAcceptedWords(scoredYank);
    for (let i = 0; i < testOutput.length; i++) {
      expect(testOutput[0][i].vernacular).toEqual(acceptedYank[i].vernacular);
      expect(testOutput[0][i].senses[0]).toEqual(acceptedYank[i].senses[0]);
    }
  });

  test("test scoreWords algorithm", () => {
    let testOutput = Finder.scoreWords(testWordList[3], testWordList);
    for (let i = 0; i < testOutput.length; i++)
      expect(testOutput[i].score).toEqual(scoredYank[i].score);
  });

  test("test QuickSort algorithm against ordered collection", () => {
    let testOutput = Finder.quicksort(scoredYank);
    for (let i = 0; i < testOutput.length; i++)
      expect(testOutput[i].score).toEqual(orderedYank[i].score);
  });

  test("test QuickSort algorithm for ordering", () => {
    let testOutput = Finder.quicksort(scoredYank);
    for (let i = 1; i < testOutput.length; i++)
      expect(testOutput[i].score <= testOutput[i - 1].score);
  });

  test("Levenshtein Distance with same Word", () => {
    expect(
      Finder.getLevenshteinDistance(
        testWordList[0].vernacular,
        testWordList[0].vernacular
      )
    ).toEqual(0);
  });

  test("Levenshtein Distance with similar Word", () => {
    expect(
      Finder.getLevenshteinDistance(
        testWordList[4].vernacular,
        testWordList[8].vernacular
      )
    ).toEqual(3);
  });

  test("Levenshtein Distance with distinct Word", () => {
    expect(
      Finder.getLevenshteinDistance(
        testWordList[8].senses[0].glosses[0].def,
        testWordList[12].senses[0].glosses[0].def
      )
    ).toEqual(16);
  });
});
