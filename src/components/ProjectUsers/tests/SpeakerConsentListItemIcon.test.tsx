import { PlayArrow } from "@mui/icons-material";
import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement } from "react";

import { ConsentType, Speaker } from "api/models";
import SpeakerConsentListItemIcon, {
  ListItemIconId,
} from "components/ProjectUsers/SpeakerConsentListItemIcon";
import { randomSpeaker } from "types/project";

jest.mock("backend", () => ({
  getConsentImageSrc: (speaker: Speaker) => mockGetConsentImageSrc(speaker),
  getConsentUrl: (speaker: Speaker) => mockGetConsentUrl(speaker),
  removeConsent: (speaker: Speaker) => mockRemoveConsent(speaker),
  uploadConsent: (args: any[]) => mockUploadConsent(...args),
}));
jest.mock(
  "components/Pronunciations/AudioPlayer",
  () => () => mockAudioPlayer()
);

const mockAudioPlayer = function MockAudioPlayer(): ReactElement {
  return <PlayArrow />;
};

const mockGetConsentImageSrc = jest.fn();
const mockGetConsentUrl = jest.fn();
const mockRemoveConsent = jest.fn();
const mockUploadConsent = jest.fn();

function setMockFunctions(): void {
  mockGetConsentImageSrc.mockResolvedValue("");
  mockGetConsentUrl.mockReturnValue("");
  mockRemoveConsent.mockResolvedValue("");
  mockUploadConsent.mockResolvedValue(randomSpeaker());
}

const mockRefresh = jest.fn();
const mockSpeaker = randomSpeaker();

async function renderSpeakerConsentListItemIcon(
  speaker = mockSpeaker
): Promise<void> {
  await act(async () => {
    render(
      <SpeakerConsentListItemIcon refresh={mockRefresh()} speaker={speaker} />
    );
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

afterEach(cleanup);

describe("SpeakerConsentListItemIcon", () => {
  describe("ConsentType.None", () => {
    it("has Add button icon", async () => {
      await renderSpeakerConsentListItemIcon({
        ...mockSpeaker,
        consent: ConsentType.None,
      });
      expect(screen.queryByTestId(ListItemIconId.AddConsent)).not.toBeNull();
      expect(screen.queryByTestId(ListItemIconId.PlayAudio)).toBeNull();
      expect(screen.queryByTestId(ListItemIconId.ShowImage)).toBeNull();
    });

    it("opens menu when clicked", async () => {
      const agent = userEvent.setup();
      await renderSpeakerConsentListItemIcon({
        ...mockSpeaker,
        consent: ConsentType.None,
      });
      expect(screen.queryByRole("menu")).toBeNull();
      expect(screen.queryByTestId(ListItemIconId.RecordAudio)).toBeNull();
      expect(screen.queryByTestId(ListItemIconId.UploadAudio)).toBeNull();

      await agent.click(screen.getByRole("button"));
      expect(screen.queryByRole("menu")).not.toBeNull();
      expect(screen.queryByTestId(ListItemIconId.RecordAudio)).not.toBeNull();
      expect(screen.queryByTestId(ListItemIconId.UploadAudio)).not.toBeNull();
    });
  });

  describe("ConsentType.Audio", () => {
    it("has AudioPlayer (mocked out by PlayArrow icon)", async () => {
      await renderSpeakerConsentListItemIcon({
        ...mockSpeaker,
        consent: ConsentType.Audio,
      });
      expect(screen.queryByTestId(ListItemIconId.AddConsent)).toBeNull();
      expect(screen.queryByTestId(ListItemIconId.PlayAudio)).not.toBeNull();
      expect(screen.queryByTestId(ListItemIconId.ShowImage)).toBeNull();
    });
  });

  describe("ConsentType.Image", () => {
    it("has Image button icon", async () => {
      await renderSpeakerConsentListItemIcon({
        ...mockSpeaker,
        consent: ConsentType.Image,
      });
      expect(screen.queryByTestId(ListItemIconId.AddConsent)).toBeNull();
      expect(screen.queryByTestId(ListItemIconId.PlayAudio)).toBeNull();
      expect(screen.queryByTestId(ListItemIconId.ShowImage)).not.toBeNull();
    });

    it("opens dialog when clicked", async () => {
      const agent = userEvent.setup();
      await renderSpeakerConsentListItemIcon({
        ...mockSpeaker,
        consent: ConsentType.Image,
      });
      expect(screen.queryByRole("dialog")).toBeNull();

      await agent.click(screen.getByRole("button"));
      expect(screen.queryByRole("dialog")).not.toBeNull();
    });
  });
});
