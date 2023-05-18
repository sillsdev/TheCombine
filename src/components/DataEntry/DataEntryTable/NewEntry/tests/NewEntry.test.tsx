import { createRef } from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import { newWritingSystem } from "types/writingSystem";

jest.mock("@mui/material/Autocomplete", () => "div");

jest.mock("components/Pronunciations/PronunciationsComponent", () => "div");
jest.mock("components/Pronunciations/Recorder");

const mockStore = configureMockStore()({ treeViewState: { open: false } });

describe("NewEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
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
        </Provider>
      );
    });
  });
});
