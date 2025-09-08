import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import AudioPlayer, {
  longPressDelay,
} from "components/Pronunciations/AudioPlayer";
import { defaultState } from "rootRedux/types";
import { newPronunciation } from "types/word";

jest.mock("backend", () => ({
  getSpeaker: () => mockGetSpeaker(),
}));
jest.mock("components/AppBar/SpeakerMenu", () => ({
  SpeakerMenuList: () => <div />,
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

async function renderAudioPlayer(canDelete = false): Promise<void> {
  await act(async () => {
    render(
      <Provider store={configureMockStore()(defaultState)}>
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
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
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

    // End press, advance timer, and verify the menu stays open
    await act(async () => {
      fireEvent.touchEnd(playButton);
    });
    expect(screen.queryByRole("menu")).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(longPressDelay);
    });
    expect(screen.queryByRole("menu")).toBeTruthy();
  });

  it("doesn't open the menu on short-press", async () => {
    // Provide deleteAudio prop so that menu is available
    await renderAudioPlayer(true);
    const playButton = screen.getByRole("button");

    // Use a mock timer to control the length of the press
    jest.useFakeTimers();

    // Press button and advance timer less than the long-press time
    expect(screen.queryByRole("menu")).toBeNull();
    await act(async () => {
      fireEvent.touchStart(playButton);
    });
    expect(screen.queryByRole("menu")).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(longPressDelay - 1);
    });
    expect(screen.queryByRole("menu")).toBeNull();

    // End press and advance timer further
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
