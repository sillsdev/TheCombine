import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import AudioPlayer, {
  longPressDelay,
} from "components/Pronunciations/AudioPlayer";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { type StoreState, defaultState } from "rootRedux/types";
import { newPronunciation } from "types/word";

jest.mock("backend", () => ({
  getSpeaker: () => mockGetSpeaker(),
}));
jest.mock("components/AppBar/SpeakerMenu", () => ({
  SpeakerMenuList: () => <div>{mockSpeakerMenuText}</div>,
}));
jest.mock("components/Dialogs", () => ({
  ButtonConfirmation: () => <div />,
}));
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => mockDispatch,
  };
});

const mockCanDeleteAudio = jest.fn();
const mockDispatch = jest.fn((action: any) => action);
const mockGetSpeaker = jest.fn();

const mockSpeakerMenuText = "speaker-menu";
const mockStore = configureMockStore()(mockPlayingState());

function mockPlayingState(fileName = ""): StoreState {
  return {
    ...defaultState,
    pronunciationsState: {
      fileName,
      status: PronunciationsStatus.Inactive,
      wordId: "",
    },
  };
}

async function renderAudioPlayer(canDelete = false): Promise<void> {
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <AudioPlayer
          audio={newPronunciation("speech.mp3")}
          deleteAudio={canDelete ? mockCanDeleteAudio : undefined}
        />
      </Provider>
    );
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("Pronunciations", () => {
  it("dispatches on play", async () => {
    await renderAudioPlayer();
    expect(mockDispatch).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button"));
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("opens the menu on long-press", async () => {
    // Provide deleteAudio prop so that menu is available
    await renderAudioPlayer(true);
    const playButton = screen.getByRole("button");

    // Use a mock timer to control the length of the press
    jest.useFakeTimers();

    // Start a press and advance the timer just shy of the long-press time
    expect(screen.queryByRole("menu")).toBeNull();
    await act(async () => {
      fireEvent.touchStart(playButton);
    });
    expect(screen.queryByRole("menu")).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(longPressDelay - 1);
    });
    expect(screen.queryByRole("menu")).toBeNull();

    // Advance the timer just past the long-press time
    await act(async () => {
      jest.advanceTimersByTime(2);
    });
    expect(screen.queryByRole("menu")).toBeTruthy();

    // Make sure the menu stays open and no play is dispatched
    await act(async () => {
      fireEvent.touchEnd(playButton);
    });
    expect(screen.queryByRole("menu")).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(longPressDelay);
    });
    expect(screen.queryByRole("menu")).toBeTruthy();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("doesn't open the menu on short-press", async () => {
    // Provide deleteAudio prop so that menu is available
    await renderAudioPlayer(true);
    const playButton = screen.getByRole("button");

    // Use a mock timer to control the length of the press
    jest.useFakeTimers();

    // Press the button and advance the timer, but end press before the long-press time
    expect(screen.queryByRole("menu")).toBeNull();
    await act(async () => {
      fireEvent.touchStart(playButton);
    });
    expect(screen.queryByRole("menu")).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(longPressDelay - 1);
    });
    expect(screen.queryByRole("menu")).toBeNull();
    await act(async () => {
      fireEvent.touchEnd(playButton);
    });
    expect(screen.queryByRole("menu")).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(2 + longPressDelay);
    });
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
