import { type TouchEvent } from "react";
import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import AudioPlayer, {
  longPressDelay,
  playButtonId,
  playMenuId,
} from "components/Pronunciations/AudioPlayer";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { type StoreState } from "rootRedux/types";
import { newPronunciation } from "types/word";

// Mock out Menu to avoid issues with setting its anchor.
jest.mock("@mui/material", () => {
  return {
    ...jest.requireActual("@mui/material"),
    Menu: (props: any) => <div {...props} />,
  };
});

jest.mock("backend", () => ({
  getSpeaker: () => mockGetSpeaker(),
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

let testRenderer: ReactTestRenderer;

const mockFileName = "speech.mp3";
const mockId = playButtonId(mockFileName);
const mockPronunciation = newPronunciation(mockFileName);
const mockStore = configureMockStore()(mockPlayingState());
const mockTouchEvent: Partial<TouchEvent<HTMLButtonElement>> = {
  currentTarget: {} as HTMLButtonElement,
};

function mockPlayingState(fileName = ""): Partial<StoreState> {
  return {
    ...defaultState,
    pronunciationsState: {
      fileName,
      status: PronunciationsStatus.Inactive,
      wordId: "",
    },
  };
}

function renderAudioPlayer(canDelete = false): void {
  act(() => {
    testRenderer = create(
      <Provider store={mockStore}>
        <AudioPlayer
          audio={mockPronunciation}
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
  it("dispatches on play", () => {
    renderAudioPlayer();
    expect(mockDispatch).not.toHaveBeenCalled();
    const playButton = testRenderer.root.findByProps({ id: mockId });
    act(() => {
      playButton.props.onClick();
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("opens the menu on long-press", () => {
    // Provide deleteAudio prop so that menu is available
    renderAudioPlayer(true);

    // Use a mock timer to control the length of the press
    jest.useFakeTimers();

    const playButton = testRenderer.root.findByProps({ id: mockId });
    const playMenu = testRenderer.root.findByProps({ id: playMenuId });

    // Start a press and advance the timer just shy of the long-press time
    expect(playMenu.props.open).toBeFalsy();
    act(() => {
      playButton.props.onTouchStart(mockTouchEvent);
    });
    expect(playMenu.props.open).toBeFalsy();
    act(() => {
      jest.advanceTimersByTime(longPressDelay - 1);
    });
    expect(playMenu.props.open).toBeFalsy();

    // Advance the timer just past the long-press time
    act(() => {
      jest.advanceTimersByTime(2);
    });
    expect(playMenu.props.open).toBeTruthy();

    // Make sure the menu stays open and no play is dispatched
    act(() => {
      playButton.props.onTouchEnd();
      jest.runAllTimers();
    });
    expect(playMenu.props.open).toBeTruthy();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("doesn't open the menu on short-press", () => {
    // Provide deleteAudio prop so that menu is available
    renderAudioPlayer(true);

    // Use a mock timer to control the length of the press
    jest.useFakeTimers();

    const playButton = testRenderer.root.findByProps({ id: mockId });
    const playMenu = testRenderer.root.findByProps({ id: playMenuId });

    // Press the button and advance the timer, but end press before the long-press time
    expect(playMenu.props.open).toBeFalsy();
    act(() => {
      playButton.props.onTouchStart(mockTouchEvent);
    });
    expect(playMenu.props.open).toBeFalsy();
    act(() => {
      jest.advanceTimersByTime(longPressDelay - 1);
    });
    expect(playMenu.props.open).toBeFalsy();
    act(() => {
      playButton.props.onTouchEnd();
    });
    expect(playMenu.props.open).toBeFalsy();
    act(() => {
      jest.advanceTimersByTime(2);
    });
    expect(playMenu.props.open).toBeFalsy();
  });
});
