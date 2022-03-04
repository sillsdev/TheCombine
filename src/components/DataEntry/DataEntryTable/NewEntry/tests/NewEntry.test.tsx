import renderer from "react-test-renderer";

import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import { newSemanticDomain } from "types/word";
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
