import renderer from "react-test-renderer";

import "tests/mockReactI18next";

import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import { newWritingSystem } from "types/writingSystem";
import { createRef } from "react";

jest.mock("@mui/material/Autocomplete", () => "div");

jest.mock("components/Pronunciations/PronunciationsComponent", () => "div");
jest.mock("components/Pronunciations/Recorder");

describe("NewEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <NewEntry
          analysisLang={newWritingSystem()}
          vernacularLang={newWritingSystem()}
          // Parent component handles new entry state:
          addNewEntry={jest.fn()}
          updateWordWithNewGloss={jest.fn()}
          newAudioUrls={[]}
          addNewAudioUrl={jest.fn()}
          delNewAudioUrl={jest.fn()}
          newGloss={""}
          setNewGloss={jest.fn()}
          newNote={""}
          setNewNote={jest.fn()}
          newVern={""}
          setNewVern={jest.fn()}
          vernInput={createRef<HTMLDivElement>()}
          // Parent component handles vern suggestion state:
          setSelectedDup={jest.fn()}
          suggestedVerns={[]}
          suggestedDups={[]}
        />
      );
    });
  });
});
