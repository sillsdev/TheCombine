import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import NewEntry, {
  NewEntryId,
} from "components/DataEntry/DataEntryTable/NewEntry";
import { newWritingSystem } from "types/writingSystem";

jest.mock("components/DataEntry/utilities.ts", () => ({
  ...jest.requireActual("components/DataEntry/utilities.ts"),
  focusInput: jest.fn(),
}));
jest.mock("components/Pronunciations/PronunciationsFrontend", () => jest.fn());

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

const renderNewEntry = async (
  vern = "",
  gloss = "",
  note = ""
): Promise<void> => {
  await act(async () => {
    render(
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

/** Enter key event options for fireEvent, for use with fake timers
 * (since fake timers and userEvent don't play nice). */
const enterOptions = { charCode: 13, code: "Enter", key: "Enter" };

beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllTimers();
});

afterEach(cleanup);

describe("NewEntry", () => {
  const getVernAndGlossFields = (): {
    vernField: HTMLElement;
    glossField: HTMLElement;
  } => {
    const vernAndGlossFields = screen.getAllByRole("combobox");
    expect(vernAndGlossFields).toHaveLength(2);
    const [vernField, glossField] = vernAndGlossFields;
    return { vernField, glossField };
  };

  it("does not submit without a vernacular", async () => {
    await renderNewEntry("", "gloss");
    await userEvent.type(getVernAndGlossFields().glossField, "{enter}");
    expect(mockAddNewEntry).not.toHaveBeenCalled();
  });

  it("does not submit with vernacular Enter if gloss is empty", async () => {
    await renderNewEntry("vern", "");
    await userEvent.type(getVernAndGlossFields().vernField, "{enter}");
    expect(mockAddNewEntry).not.toHaveBeenCalled();
  });

  it("does submit with gloss Enter if gloss is empty", async () => {
    await renderNewEntry("vern", "");
    await userEvent.type(getVernAndGlossFields().glossField, "{enter}");
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
  });

  it("resets when the delete button is clicked", async () => {
    await renderNewEntry();
    expect(mockResetNewEntry).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId(NewEntryId.ButtonDelete));
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
    const { glossField } = getVernAndGlossFields();
    await act(async () => {
      fireEvent.keyDown(glossField, enterOptions);
      fireEvent.keyPress(glossField, enterOptions);
      fireEvent.keyUp(glossField, enterOptions);
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
    expect(mockResetNewEntry).not.toHaveBeenCalled();

    // Run the timers and confirm a reset
    await act(async () => {
      jest.runAllTimers();
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
    expect(mockResetNewEntry).toHaveBeenCalledTimes(1);
  });

  it("doesn't allow double submission", async () => {
    await renderNewEntry("vern", "gloss");

    // Use a mock timer to control when addNewEntry completes
    jest.useFakeTimers();
    mockAddNewEntry.mockImplementation(
      async () => await new Promise((res) => setTimeout(res, 1000))
    );

    // Submit a new entry
    const { glossField } = getVernAndGlossFields();
    await act(async () => {
      fireEvent.keyDown(glossField, enterOptions);
      fireEvent.keyPress(glossField, enterOptions);
      fireEvent.keyUp(glossField, enterOptions);
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
    expect(mockResetNewEntry).not.toHaveBeenCalled();

    // Attempt a second submission before the first one completes
    await act(async () => {
      fireEvent.keyDown(glossField, enterOptions);
      fireEvent.keyPress(glossField, enterOptions);
      fireEvent.keyUp(glossField, enterOptions);
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
    expect(mockResetNewEntry).not.toHaveBeenCalled();

    // Run the timers and confirm no second submission
    await act(async () => {
      jest.runAllTimers();
    });
    expect(mockAddNewEntry).toHaveBeenCalledTimes(1);
    expect(mockResetNewEntry).toHaveBeenCalledTimes(1);
  });
});
