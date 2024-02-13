import { type ReactElement, createRef } from "react";
import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import {
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import NewEntry, {
  NewEntryId,
} from "components/DataEntry/DataEntryTable/NewEntry";
import { newWritingSystem } from "types/writingSystem";

jest.mock(
  "@mui/material/Autocomplete",
  () => (props: any) => mockAutocomplete(props)
);

jest.mock("components/Pronunciations/PronunciationsFrontend", () => "div");

/** Bypass the Autocomplete and render its internal input with the props of both. */
const mockAutocomplete = (props: {
  renderInput: (params: any) => ReactElement;
}): ReactElement => {
  const { renderInput, ...params } = props;
  return renderInput(params);
};

const mockAddNewAudio = jest.fn();
const mockAddNewEntry = jest.fn();
const mockDelNewAudio = jest.fn();
const mockSetNewGloss = jest.fn();
const mockSetNewNote = jest.fn();
const mockSetNewVern = jest.fn();
const mockSetSelectedDup = jest.fn();
const mockSetSelectedSense = jest.fn();
const mockRepNewAudio = jest.fn();
const mockResetNewEntry = jest.fn();
const mockUpdateWordWithNewGloss = jest.fn();

const mockStore = configureMockStore()({ treeViewState: { open: false } });

let renderer: ReactTestRenderer;

const renderNewEntry = async (
  vern = "",
  gloss = "",
  note = ""
): Promise<void> => {
  await act(async () => {
    renderer = create(
      <Provider store={mockStore}>
        <NewEntry
          analysisLang={newWritingSystem()}
          vernacularLang={newWritingSystem()}
          // Parent component handles new entry state:
          addNewEntry={mockAddNewEntry}
          resetNewEntry={mockResetNewEntry}
          updateWordWithNewGloss={mockUpdateWordWithNewGloss}
          newAudio={[]}
          addNewAudio={mockAddNewAudio}
          delNewAudio={mockDelNewAudio}
          repNewAudio={mockRepNewAudio}
          newGloss={gloss}
          setNewGloss={mockSetNewGloss}
          newNote={note}
          setNewNote={mockSetNewNote}
          newVern={vern}
          setNewVern={mockSetNewVern}
          vernInput={createRef<HTMLInputElement>()}
          // Parent component handles vern suggestion state:
          setSelectedDup={mockSetSelectedDup}
          setSelectedSense={mockSetSelectedSense}
          suggestedVerns={[]}
          suggestedDups={[]}
        />
      </Provider>
    );
  });
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("NewEntry", () => {
  it("does not submit without a vernacular", async () => {
    await renderNewEntry("", "gloss");
    await act(async () => {
      renderer.root.findByType(GlossWithSuggestions).props.handleEnter();
    });
    expect(mockAddNewEntry).not.toHaveBeenCalled();
  });

  it("does not submit with vernacular Enter if gloss is empty", async () => {
    await renderNewEntry("vern", "");
    await act(async () => {
      renderer.root.findByType(VernWithSuggestions).props.handleEnter();
    });
    expect(mockAddNewEntry).not.toHaveBeenCalled();
  });

  it("does submit with gloss Enter if gloss is empty", async () => {
    await renderNewEntry("vern", "");
    await act(async () => {
      renderer.root.findByType(GlossWithSuggestions).props.handleEnter();
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
  });

  it("resets when the delete button is clicked", async () => {
    await renderNewEntry();
    expect(mockResetNewEntry).not.toHaveBeenCalled();
    await act(async () => {
      renderer.root
        .findByProps({ id: NewEntryId.ButtonDelete })
        .props.onClick();
    });
    expect(mockResetNewEntry).toHaveBeenCalledTimes(1);
  });

  it("resets new entry after awaiting add", async () => {
    await renderNewEntry("vern", "gloss");

    // Use a mock timer to control when addNewEntry completes
    jest.useFakeTimers();
    mockAddNewEntry.mockImplementation(
      async () => await new Promise((res) => setTimeout(res, 1000))
    );

    // Submit a new entry
    await act(async () => {
      renderer.root.findByType(GlossWithSuggestions).props.handleEnter();
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
    expect(mockResetNewEntry).not.toHaveBeenCalled();

    // Run the timers and confirm a reset
    await act(async () => {
      jest.runAllTimers();
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
    expect(mockResetNewEntry).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it("doesn't allow double submission", async () => {
    await renderNewEntry("vern", "gloss");

    // Use a mock timer to control when addNewEntry completes
    jest.useFakeTimers();
    mockAddNewEntry.mockImplementation(
      async () => await new Promise((res) => setTimeout(res, 1000))
    );

    // Submit a new entry
    const gloss = renderer.root.findByType(GlossWithSuggestions);
    await act(async () => {
      gloss.props.handleEnter();
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
    expect(mockResetNewEntry).not.toHaveBeenCalled();

    // Attempt a second submission before the first one completes
    await act(async () => {
      gloss.props.handleEnter();
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
    expect(mockResetNewEntry).not.toHaveBeenCalled();

    // Run the timers and confirm no second submission
    await act(async () => {
      jest.runAllTimers();
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
    expect(mockResetNewEntry).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
