import {
  filterWords,
  filterWordsByDomain,
  sortDomainWordByVern,
} from "components/DataEntry/DataEntryComponent";
import SemanticDomainWithSubdomains, { baseDomain } from "types/SemanticDomain";
import { DomainWord, Sense, simpleWord, State, Word } from "types/word";

const mockWord = simpleWord("", "");
const mockDomainWord: DomainWord = {
  word: mockWord,
  gloss: mockWord.senses[0].glosses[0],
};

describe("DataEntryComponent", () => {
  describe("filterWords", () => {
    it("should return empty Word Array when given empty Word Array", () => {
      const words: Word[] = [];
      const expectedWords: Word[] = [];
      expect(filterWords(words)).toEqual(expectedWords);
    });

    it("should filter out words that are inaccessible", () => {
      const words: Word[] = [
        {
          ...mockWord,
          senses: [new Sense()],
        },
      ];
      const expectedWords: Word[] = [];
      expect(filterWords(words)).toEqual(expectedWords);
    });

    it("should not filter words that are accessible", () => {
      const words: Word[] = [
        {
          ...mockWord,
          senses: [{ ...new Sense(), accessibility: State.Active }],
        },
      ];
      const expectedWords: Word[] = [...words];
      expect(filterWords(words)).toEqual(expectedWords);
    });
  });

  it("filterWordsByDomain filters out words that do not match desired domain", () => {
    const mockDomains: SemanticDomainWithSubdomains[] = [
      { ...baseDomain },
      { ...baseDomain },
    ];

    mockDomains[0].name = "daily";
    mockDomains[0].id = "ID_one";
    mockDomains[1].name = "weather";
    mockDomains[1].id = "ID_two";

    const sense: Sense[] = [
      { ...new Sense("", "", mockDomains[0]), accessibility: State.Active },
      { ...new Sense("", "", mockDomains[1]), accessibility: State.Active },
    ];

    const unfilteredWords: Word[] = [
      {
        ...mockWord,
        vernacular: "one",
        senses: [...mockWord.senses, sense[0]],
      },
      {
        ...mockWord,
        vernacular: "two",
        senses: [...mockWord.senses, sense[1]],
      },
      {
        ...mockWord,
        vernacular: "three",
        senses: [...mockWord.senses, sense[0]],
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
    const mockDomain = baseDomain;
    mockDomain.name = "daily";
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
