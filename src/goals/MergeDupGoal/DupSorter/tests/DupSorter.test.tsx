import DupSorter, { SortStyle } from "../DupSorter";
import { Word, State } from "../../../../types/word";

const w0: Word = createDummyWord("Bar", "Bar");
const w1: Word = createDummyWord("Baz", "Baz");
const w2: Word = createDummyWord("BazBaz", "BazBaz");
const w3: Word = createDummyWord("Foo", "Foo");

describe("Test the DupSorter class", () => {
  it("Sorts a list of words correctly - ascending", () => {
    let tmpData: Word[] = [w3, w1, w2, w0]; // Foo, Baz, BazBaz, Bar
    let sort: DupSorter = new DupSorter(SortStyle.VERN_ASCENDING);
    expect(sort.sort(tmpData)).toEqual([w0, w1, w2, w3]);
  });

  it("Sorts a list of words correctly - descending", () => {
    let tmpData: Word[] = [w0, w1, w3, w2]; // Foo, Baz, BazBaz, Bar
    let sort: DupSorter = new DupSorter(SortStyle.VERN_DESCENDING);
    expect(sort.sort(tmpData)).toEqual([w3, w2, w1, w0]);
  });
});

function createDummyWord(vern: string, gloss: string): Word {
  return {
    id: "",
    vernacular: vern,
    senses: [
      {
        glosses: [
          {
            language: "",
            def: gloss
          }
        ],
        semanticDomains: []
      }
    ],
    audio: "",
    created: "",
    modified: "",
    history: [],
    partOfSpeech: "",
    editedBy: [],
    accessability: State.active,
    otherField: "",
    plural: ""
  };
}
