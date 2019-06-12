import DupFinder, { ScoredWord } from "../DupFinder";
import { Word, simpleWord } from "../../../../types/word";

describe("dupFinder Tests", () => {
  let Finder = new DupFinder();

  //TEST UTILS

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
        gloss: "No",
        audioFile: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: ""
      },
      score: 0
    },
    {
      word: {
        id: "7518701",
        vernacular: "Yang",
        gloss: "Die",
        audioFile: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: ""
      },
      score: 2
    },
    {
      word: {
        id: "921780",
        vernacular: "Yank",
        gloss: "Please god help me",
        audioFile: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: ""
      },
      score: 0
    }
  ];
  let orderedYank: ScoredWord[] = [
    {
      word: {
        id: "6212061",
        vernacular: "Yank",
        gloss: "No",
        audioFile: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: ""
      },
      score: 0
    },
    {
      word: {
        id: "921780",
        vernacular: "Yank",
        gloss: "Please god help me",
        audioFile: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: ""
      },
      score: 0
    },
    {
      word: {
        id: "7518701",
        vernacular: "Yang",
        gloss: "Die",
        audioFile: "",
        created: "now",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: 0,
        otherField: ""
      },
      score: 2
    }
  ];
  let acceptedYank: Word[] = [
    {
      id: "921780",
      vernacular: "Yank",
      gloss: "Please god help me",
      audioFile: "",
      created: "now",
      modified: "",
      history: [],
      partOfSpeech: "",
      editedBy: [],
      accessability: 0,
      otherField: ""
    },
    {
      id: "6212061",
      vernacular: "Yank",
      gloss: "No",
      audioFile: "",
      created: "now",
      modified: "",
      history: [],
      partOfSpeech: "",
      editedBy: [],
      accessability: 0,
      otherField: ""
    },
    {
      id: "7518701",
      vernacular: "Yang",
      gloss: "Die",
      audioFile: "",
      created: "now",
      modified: "",
      history: [],
      partOfSpeech: "",
      editedBy: [],
      accessability: 0,
      otherField: ""
    }
  ];

  //placeholder for now (dependent on getWordsFromDB)
  test("test getNextDups", () => {});
  //placeholder for now
  test("test getWordsFromDB", () => {});

  //test that getDupsFromWordList properly strings together scoring and accepting
  test("test getDupsFromWordList", () => {
    let testOutput = Finder.getDupsFromWordList(testWordList[3], testWordList);
    for (let i = 0; i < testOutput.length; i++) {
      expect(testOutput[i].vernacular).toEqual(acceptedYank[i].vernacular);
      expect(testOutput[i].gloss).toEqual(acceptedYank[i].gloss);
    }
  });

  //test that getAcceptedWords properly strings together sorting and converting to Word
  test("test getAcceptedWords", () => {
    let testOutput = Finder.getAcceptedWords(scoredYank);
    for (let i = 0; i < testOutput.length; i++) {
      expect(testOutput[i].vernacular).toEqual(acceptedYank[i].vernacular);
      expect(testOutput[i].gloss).toEqual(acceptedYank[i].gloss);
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
    ).toEqual(2);
  });

  test("Levenshtein Distance with distinct Word", () => {
    expect(
      Finder.getLevenshteinDistance(
        testWordList[8].gloss,
        testWordList[12].gloss
      )
    ).toEqual(14);
  });
});
