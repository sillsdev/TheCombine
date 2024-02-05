import { createRef } from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import NewEntry from "components/DataEntry/DataEntryTable/NewEntry";
import { newWritingSystem } from "types/writingSystem";

jest.mock("@mui/material/Autocomplete", () => "div");

jest.mock("components/Pronunciations/PronunciationsFrontend", () => "div");

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
            resetNewEntry={jest.fn()}
            updateWordWithNewGloss={jest.fn()}
            newAudio={[]}
            addNewAudio={jest.fn()}
            delNewAudio={jest.fn()}
            repNewAudio={jest.fn()}
            newGloss={""}
            setNewGloss={jest.fn()}
            newNote={""}
            setNewNote={jest.fn()}
            newVern={""}
            setNewVern={jest.fn()}
            vernInput={createRef<HTMLInputElement>()}
            // Parent component handles vern suggestion state:
            setSelectedDup={jest.fn()}
            setSelectedSense={jest.fn()}
            suggestedVerns={[]}
            suggestedDups={[]}
          />
        </Provider>
      );
    });
  });
});
