import "@testing-library/jest-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { Speaker } from "api/models";
import SpeakerMenu from "components/AppBar/SpeakerMenu";
import { defaultState } from "components/Project/ProjectReduxTypes";
import { type StoreState } from "rootRedux/types";
import { randomSpeaker } from "types/project";

jest.mock("backend", () => ({
  getAllSpeakers: () => mockGetAllSpeakers(),
}));
jest.mock("components/Project/ProjectActions", () => ({}));

const mockGetAllSpeakers = jest.fn();
const mockState = (speaker?: Speaker): Partial<StoreState> => ({
  currentProjectState: {
    ...defaultState,
    speaker: speaker ?? defaultState.speaker,
    project: { ...defaultState.project, id: "mock-project-id" },
  },
});
const testIdSelectedIcon = "CircleIcon"; // MUI Icon data-testid

function setMockFunctions(): void {
  mockGetAllSpeakers.mockResolvedValue([]);
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

async function renderSpeakerMenu(speaker?: Speaker): Promise<void> {
  await act(async () => {
    render(
      <Provider store={configureMockStore()(mockState(speaker))}>
        <SpeakerMenu />
      </Provider>
    );
  });
}

describe("SpeakerMenu", () => {
  it("renders with a single button", async () => {
    await renderSpeakerMenu();
    expect(screen.queryAllByRole("button").length).toEqual(1);
  });

  it("has one disabled menu item if no speakers", async () => {
    // Render and click.
    await renderSpeakerMenu();
    await userEvent.click(screen.getByRole("button"));

    // Verify lone disabled item and no divider.
    const loneMenuItem = screen.getByRole("menuitem");
    expect(loneMenuItem).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("has divider and one more menu item than speakers", async () => {
    // Set up, render, and click.
    const speakers = [randomSpeaker(), randomSpeaker(), randomSpeaker()];
    mockGetAllSpeakers.mockResolvedValueOnce(speakers);
    await renderSpeakerMenu();
    await userEvent.click(screen.getByRole("button"));

    // Verify all items present.
    expect(screen.queryByRole("separator")).toBeTruthy();
    expect(screen.queryAllByRole("menuitem")).toHaveLength(speakers.length + 1);
  });

  it("has current speaker marked", async () => {
    // Set up, render, and click.
    const currentSpeaker = randomSpeaker();
    const speakers = [randomSpeaker(), currentSpeaker, randomSpeaker()];
    mockGetAllSpeakers.mockResolvedValueOnce(speakers);
    await renderSpeakerMenu(currentSpeaker);
    await userEvent.click(screen.getByRole("button"));

    // Verify only the second item has the icon.
    screen.queryAllByRole("menuitem").forEach((item, i) => {
      const circle = within(item).queryByTestId(testIdSelectedIcon);
      if (i === 1) {
        expect(circle).toBeTruthy();
      } else {
        expect(circle).toBeNull();
      }
    });
  });

  it("has none-of-the-above marked", async () => {
    // Set up, render, and click.
    const speakers = [randomSpeaker(), randomSpeaker(), randomSpeaker()];
    mockGetAllSpeakers.mockResolvedValueOnce(speakers);
    await renderSpeakerMenu();
    await userEvent.click(screen.getByRole("button"));

    // Verify only the last item has the icon.
    screen.queryAllByRole("menuitem").forEach((item, i) => {
      const circle = within(item).queryByTestId(testIdSelectedIcon);
      if (i === speakers.length) {
        expect(circle).toBeTruthy();
      } else {
        expect(circle).toBeNull();
      }
    });
  });
});
