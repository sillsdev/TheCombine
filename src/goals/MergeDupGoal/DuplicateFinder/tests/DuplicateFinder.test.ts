//Sam Delaney, 6/12/19

import DupFinder, { DefaultParams } from "../DuplicateFinder";
import { Word, simpleWord } from "../../../../types/word";
import axios from "axios";

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("dupFinder Tests", () => {
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

  test("getNextDups returns correct number of word collections", async () => {
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: testWordList })
    );

    let finder = new DupFinder();

    await finder.getNextDups(7).then(wordCollections => {
      expect(wordCollections.length).toBe(7);
    });
  });

  test("finder can get words from frontier", async () => {
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: testWordList })
    );

    let finder = new DupFinder();

    expect(finder.maskedWords.length).toBe(0);

    await finder.fetchWordsFromDB().then(gotWords => {
      expect(gotWords).toBe(true);
      expect(finder.maskedWords.length).toBe(testWordList.length);
    });
  });

  test("the finder can search for duplicates with one parent", async () => {
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: testWordList })
    );

    let finder = new DupFinder();

    let parent = simpleWord("Yank", "Mayonnaise");

    let duplicates: [Word[], number] = [[], Number.MIN_SAFE_INTEGER];
    await finder.fetchWordsFromDB().then(gotWords => {
      duplicates = finder.getDuplicatesOfWord(parent);

      duplicates[0].forEach(duplicate => {
        let vernScore = finder.getLevenshteinDistance(
          duplicate.vernacular,
          parent.vernacular
        );
        let glossScore =
          finder.getLevenshteinDistance(
            duplicate.senses[0].glosses[0].def,
            parent.senses[0].glosses[0].def
          ) * 3;

        expect(
          glossScore + vernScore <= DefaultParams.maxScore ||
            glossScore === 0 ||
            vernScore <= 1
        ).toBe(true);
      });
    });
  });

  test("Levenshtein Distance with same Word", () => {
    let finder = new DupFinder();
    expect(finder.getLevenshteinDistance("testing", "testing")).toEqual(0);
  });

  test("Levenshtein Distance with similar Word", () => {
    let finder = new DupFinder();
    expect(finder.getLevenshteinDistance("testing", "toasting")).toEqual(2);
  });

  test("Levenshtein Distance with distinct Word", () => {
    let finder = new DupFinder();
    expect(
      finder.getLevenshteinDistance(
        "badger",
        "testWordList[12].senses[0].glosses[0].def"
      )
    ).toEqual(39);
  });
});
