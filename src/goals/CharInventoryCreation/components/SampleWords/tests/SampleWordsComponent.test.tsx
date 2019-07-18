import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import SampleWords, {
  SampleWords as SampleComponent
} from "../SampleWordsComponent";
import ReactDOM from "react-dom";
import { Word } from "../../../../../types/word";

var wordsMaster: ReactTestRenderer;
var wordsHandle: SampleComponent;

const SET_INV = jest.fn();
const MAX: number = 5; // Maximum number of words given to user at a time; DATA must be greater than this length
const DATA: string[] = ["a", "ab", "b", "abc", "a", "bbc", "abcd"];

describe("Testing Sample Words Component", () => {
  beforeAll(() => {
    createTree([]);
  });

  beforeEach(() => {
    SET_INV.mockClear();
  });

  it("Renders without crashing", async () => {
    const div = document.createElement("div");
    await ReactDOM.render(
      <SampleWords allCharacters={[]} addToAcceptedCharacters={SET_INV} />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("Correctly adds words to the list", () => {
    wordsHandle.allWords = createTestWords(DATA);
    wordsHandle.getWords();
    expect(wordsHandle.state.words).toEqual(DATA.slice(0, MAX));
  });

  it("Adds words to the list, ignoring values in its ignore list", () => {
    let ignore: string[] = [DATA[0], DATA[3]];
    let result: string[] = DATA.filter(
      (val: string) => ignore.indexOf(val) === -1
    ).slice(0, MAX);

    wordsHandle.allWords = createTestWords(DATA);
    wordsHandle.setState({ ignoreList: ignore });

    wordsHandle.getWords();
    expect(wordsHandle.state.words).toEqual(result);
  });

  it("Adds words to the list, ignoring words with no new characters", () => {
    let result: string[] = [DATA[3], DATA[5], DATA[6]];
    createTree(["a", "b"]);
    wordsHandle.allWords = createTestWords(DATA);

    wordsHandle.getWords();
    expect(wordsHandle.state.words).toEqual(result);

    // Cleanup
    createTree([]);
  });

  it("Adds words to character set, removing whitespace", () => {
    createTree(["a", "b"]);
    wordsHandle.addToCharSet("y o d e l \n");
    expect(SET_INV).toHaveBeenCalledWith(["y", "o", "d", "e", "l"]);
    createTree([]);
  });

  it("Adds words to the ignore list", () => {
    let ignore: string = "ignore me plz";
    wordsHandle.addWordToIgnoreList(ignore);

    expect(wordsHandle.state.ignoreList).toEqual([ignore]);
  });
});

// Create a state tree with the specified inventory
function createTree(inventory: string[]) {
  renderer.act(() => {
    wordsMaster = renderer.create(
      <SampleWords
        allCharacters={inventory}
        addToAcceptedCharacters={SET_INV}
      />
    );
  });
  wordsHandle = wordsMaster.root.findByType(SampleComponent).instance;
}

// Convert an array of strings into a set of faux Word objects to use in testing (THESE DO NOT CONTAIN ALL FIELDS OF WORD!)
function createTestWords(data: string[]): Word[] {
  let words: { vernacular: string }[] = [];
  for (let i: number = 0; i < data.length; i++) {
    words[i] = { vernacular: data[i] };
  }
  return words as Word[];
}
