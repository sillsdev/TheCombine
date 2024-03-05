import renderer from "react-test-renderer";

import "tests/reactI18nextMock.ts";

import ProjectSpeakersList, {
  AddSpeakerListItem,
  SpeakerListItem,
} from "components/ProjectUsers/ProjectSpeakersList";
import { randomSpeaker } from "types/project";

jest.mock("backend", () => ({
  createSpeaker: (args: any[]) => mockCreateSpeaker(...args),
  deleteSpeaker: (args: any[]) => mockDeleteSpeaker(...args),
  getAllSpeakers: (projectId?: string) => mockGetAllSpeakers(projectId),
  updateSpeakerName: (args: any[]) => mockUpdateSpeakerName(...args),
}));

const mockCreateSpeaker = jest.fn();
const mockDeleteSpeaker = jest.fn();
const mockGetAllSpeakers = jest.fn();
const mockUpdateSpeakerName = jest.fn();

const mockProjId = "mock-project-id";
const mockSpeakers = [randomSpeaker(), randomSpeaker(), randomSpeaker()];

let testRenderer: renderer.ReactTestRenderer;

const renderProjectSpeakersList = async (
  projId = mockProjId
): Promise<void> => {
  await renderer.act(async () => {
    testRenderer = renderer.create(<ProjectSpeakersList projectId={projId} />);
  });
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("ProjectSpeakersList", () => {
  it("shows right number of speakers and an item to add a speaker", async () => {
    mockGetAllSpeakers.mockResolvedValue(mockSpeakers);
    await renderProjectSpeakersList();
    expect(testRenderer.root.findAllByType(SpeakerListItem)).toHaveLength(
      mockSpeakers.length
    );
    expect(testRenderer.root.findByType(AddSpeakerListItem)).toBeTruthy();
  });
});
