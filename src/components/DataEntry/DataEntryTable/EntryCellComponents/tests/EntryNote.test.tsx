import { AddComment, Comment } from "@material-ui/icons";
import renderer from "react-test-renderer";

import "tests/mockReactI18next";

import EntryNote from "components/DataEntry/DataEntryTable/EntryCellComponents/EntryNote";

const mockText = "Test text";

let testMaster: renderer.ReactTestRenderer;
let testHandle: renderer.ReactTestInstance;

function renderWithText(text: string) {
  renderer.act(() => {
    testMaster = renderer.create(
      <EntryNote noteText={text} updateNote={jest.fn()} buttonId="" />
    );
  });
  testHandle = testMaster.root;
}

describe("DeleteEntry", () => {
  it("renders without note", () => {
    renderWithText("");
    expect(testHandle.findAllByType(AddComment).length).toBe(1);
    expect(testHandle.findAllByType(Comment).length).toBe(0);
  });

  it("renders with note", () => {
    renderWithText(mockText);
    expect(testHandle.findAllByType(AddComment).length).toBe(0);
    expect(testHandle.findAllByType(Comment).length).toBe(1);
  });
});
