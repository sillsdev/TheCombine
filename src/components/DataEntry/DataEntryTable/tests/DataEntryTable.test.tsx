import React from "react";
import ReactDOM from "react-dom";
import DataEntryTable, { filterWords } from "../DataEntryTable";
import { mockDomainTree } from "../../tests/MockDomainTree";
import { SemanticDomain, Word, State } from "../../../../types/word";
import { mockWord } from "../../tests/MockWord";

export const mockSemanticDomain: SemanticDomain = {
  name: "",
  id: ""
};

jest.mock("../../../Pronunciations/Recorder");

describe("Tests DataEntryTable", () => {
  it("renders without crashing when not displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <DataEntryTable
        domain={mockDomainTree}
        semanticDomain={mockSemanticDomain}
        displaySemanticDomainView={(isGettingSemanticdomain: boolean) => {}}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("should filter out words that are not accessible", () => {
    let words: Word[] = [];
    let expectedWords: Word[] = [];
    expect(filterWords(words)).toEqual(expectedWords);
  });

  it("should filter out words that are inaccessible", () => {
    let word = { ...mockWord };
    word.senses[0].accessibility = State.active;
    let words: Word[] = [
      {
        ...mockWord,
        senses: [
          {
            glosses: [],
            semanticDomains: []
          }
        ]
      }
    ];
    let expectedWords: Word[] = [];
    expect(filterWords(words)).toEqual(expectedWords);
  });

  it("should filter out words that are inaccessible", () => {
    let word = { ...mockWord };
    word.senses[0].accessibility = State.active;
    let words: Word[] = [
      {
        ...mockWord,
        senses: [
          {
            glosses: [],
            semanticDomains: [],
            accessibility: State.active
          }
        ]
      }
    ];
    let expectedWords: Word[] = [...words];
    expect(filterWords(words)).toEqual(expectedWords);
  });
});
