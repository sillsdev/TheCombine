import { Circle } from "@mui/icons-material";
import { Button, Divider, MenuItem } from "@mui/material";
import { Provider } from "react-redux";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Speaker } from "api/models";
import SpeakerMenu, { SpeakerMenuList } from "components/AppBar/SpeakerMenu";
import { defaultState } from "components/Project/ProjectReduxTypes";
import { StoreState } from "types";
import { randomSpeaker } from "types/project";

jest.mock("backend", () => ({
  getAllSpeakers: () => mockGetAllSpeakers(),
}));

const mockProjId = "mock-project-id";
const mockGetAllSpeakers = jest.fn();
const mockState = (speaker?: Speaker): Partial<StoreState> => ({
  currentProjectState: {
    ...defaultState,
    speaker: speaker ?? defaultState.speaker,
    project: { ...defaultState.project, id: mockProjId },
  },
});

function setMockFunctions(): void {
  mockGetAllSpeakers.mockResolvedValue([]);
}

let testRenderer: ReactTestRenderer;

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

describe("SpeakerMenu", () => {
  it("renders", async () => {
    await act(async () => {
      testRenderer = create(
        <Provider store={configureMockStore()(mockState())}>
          <SpeakerMenu />
        </Provider>
      );
    });
    expect(testRenderer.root.findAllByType(Button).length).toEqual(1);
  });
});

describe("SpeakerMenuList", () => {
  it("has one disabled menu item if no speakers", async () => {
    await renderMenuList();
    const menuItem = testRenderer.root.findByType(MenuItem);
    expect(menuItem).toBeDisabled;
  });

  it("has divider and one more menu item than speakers", async () => {
    const speakers = [randomSpeaker(), randomSpeaker(), randomSpeaker()];
    mockGetAllSpeakers.mockResolvedValueOnce(speakers);
    await renderMenuList();
    testRenderer.root.findByType(Divider);
    const menuItems = testRenderer.root.findAllByType(MenuItem);
    expect(menuItems).toHaveLength(speakers.length + 1);
  });

  it("current speaker marked", async () => {
    const currentSpeaker = randomSpeaker();
    const speakers = [randomSpeaker(), currentSpeaker, randomSpeaker()];
    mockGetAllSpeakers.mockResolvedValueOnce(speakers);
    await renderMenuList(currentSpeaker.id);
    const items = testRenderer.root.findAllByType(MenuItem);
    for (let i = 0; i < items.length; i++) {
      expect(items[i].findAllByType(Circle)).toHaveLength(i === 1 ? 1 : 0);
    }
  });

  it("none-of-the-above marked", async () => {
    const speakers = [randomSpeaker(), randomSpeaker(), randomSpeaker()];
    mockGetAllSpeakers.mockResolvedValueOnce(speakers);
    await renderMenuList();
    const items = testRenderer.root.findAllByType(MenuItem);
    for (let i = 0; i < items.length; i++) {
      expect(items[i].findAllByType(Circle)).toHaveLength(
        i === items.length - 1 ? 1 : 0
      );
    }
  });
});

async function renderMenuList(selectedId?: string): Promise<void> {
  await act(async () => {
    testRenderer = create(
      <Provider store={configureMockStore()(mockState())}>
        <SpeakerMenuList onSelect={jest.fn()} selectedId={selectedId} />
      </Provider>
    );
  });
}
