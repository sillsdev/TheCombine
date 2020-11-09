import { AddComment, Comment } from "@material-ui/icons";
import React from "react";
import renderer from "react-test-renderer";

import { Word } from "../../../../../types/word";
import EntryNote from "../EntryNote";

const mockWord = new Word();
const mockText = "Test text";

let testMaster: renderer.ReactTestRenderer;
let testHandle: renderer.ReactTestInstance;

function renderWithWord(word: Word) {
  renderer.act(() => {
    testMaster = renderer.create(
      <EntryNote entry={word} updateNote={jest.fn()} />
    );
  });
  testHandle = testMaster.root;
}

describe("DeleteEntry", () => {
  it("renders without note", () => {
    renderWithWord(mockWord);
    expect(testHandle.findAllByType(AddComment).length).toBe(1);
    expect(testHandle.findAllByType(Comment).length).toBe(0);
  });

  it("renders with note", () => {
    renderWithWord({ ...mockWord, note: { language: "en", text: mockText } });
    expect(testHandle.findAllByType(AddComment).length).toBe(0);
    expect(testHandle.findAllByType(Comment).length).toBe(1);
  });
});
