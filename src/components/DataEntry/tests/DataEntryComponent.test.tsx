import { State, Word } from "api/models";
import {
  filterWords,
  filterWordsByDomain,
  sortDomainWordByVern,
} from "components/DataEntry/DataEntryComponent";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import { DomainWord, newSense, simpleWord } from "types/word";

const mockWord = simpleWord("", "");
const mockDomainWord: DomainWord = {
  word: mockWord,
  gloss: mockWord.senses[0].glosses[0],
};

describe("DataEntryComponent", () => {
  describe("filterWords", () => {
    it("returns empty Word Array when given empty Word Array.", () => {
      const words: Word[] = [];
      const expectedWords: Word[] = [];
      expect(filterWords(words)).toEqual(expectedWords);
    });

    it("filters out words that aren't Active.", () => {
      const words: Word[] = [
        {
          ...mockWord,
          senses: [{ ...newSense(), accessibility: State.Deleted }],
        },
        {
          ...mockWord,
          senses: [{ ...newSense(), accessibility: State.Duplicate }],
        },
      ];
      expect(filterWords(words)).toHaveLength(0);
    });

    it("doesn't filter words that are Active.", () => {
      const words: Word[] = [
        {
          ...mockWord,
          senses: [newSense()],
        },
      ];
      expect(filterWords(words)).toHaveLength(1);
    });
  });

  it("filterWordsByDomain filters out words that do not match desired domain", () => {
    const mockDomains = [
      new TreeSemanticDomain("ID_one", "daily"),
      new TreeSemanticDomain("ID_two, weather"),
    ];

    const senses = [
      newSense("", "", mockDomains[0]),
      newSense("", "", mockDomains[1]),
    ];

    const unfilteredWords: Word[] = [
      {
        ...mockWord,
        vernacular: "one",
        senses: [...mockWord.senses, senses[0]],
      },
      {
        ...mockWord,
        vernacular: "two",
        senses: [...mockWord.senses, senses[1]],
      },
      {
        ...mockWord,
        vernacular: "three",
        senses: [...mockWord.senses, senses[0]],
      },
    ];

    const domainWords: DomainWord[] = [];
    const curDomainWord: DomainWord = {
      word: unfilteredWords[1],
      gloss: unfilteredWords[1].senses[0].glosses[0],
    };
    domainWords.push(curDomainWord);
    expect(filterWordsByDomain(unfilteredWords, mockDomains[1])).toStrictEqual(
      domainWords
    );
  });

  it("sortDomainWordByVern sorts words alphabetically", () => {
    const mockDomain = new TreeSemanticDomain("ID_one", "daily");
    const unfilteredWords: Word[] = [
      { ...mockWord },
      { ...mockWord },
      { ...mockWord },
    ];
    const filteredDomainWords: DomainWord[] = [
      { ...mockDomainWord },
      { ...mockDomainWord },
      { ...mockDomainWord },
    ];

    for (const currentWord of unfilteredWords) {
      currentWord.senses[0].semanticDomains[0] = mockDomain;
    }
    unfilteredWords[0].vernacular = "Always";
    unfilteredWords[1].vernacular = "Be";
    unfilteredWords[2].vernacular = "?character";

    filteredDomainWords[0].word = unfilteredWords[0];
    filteredDomainWords[1].word = unfilteredWords[1];
    filteredDomainWords[2].word = unfilteredWords[2];

    const expectedList = [
      filteredDomainWords[2],
      filteredDomainWords[0],
      filteredDomainWords[1],
    ];
    expect(sortDomainWordByVern(unfilteredWords, mockDomain)).toStrictEqual(
      expectedList
    );
  });
});
