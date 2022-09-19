import renderer from "react-test-renderer";

import "tests/mockReactI18next";

import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import { newSemanticDomain } from "types/semanticDomain";
import { newWritingSystem } from "types/writingSystem";

jest.mock("components/Pronunciations/PronunciationsComponent", () => "div");
jest.mock("components/Pronunciations/Recorder");

describe("NewEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <NewEntry
          allWords={[]}
          defunctWordIds={[]}
          updateWordWithNewGloss={jest.fn()}
          addNewWord={jest.fn()}
          semanticDomain={newSemanticDomain()}
          setIsReadyState={jest.fn()}
          analysisLang={newWritingSystem()}
          vernacularLang={newWritingSystem()}
        />
      );
    });
  });
});
