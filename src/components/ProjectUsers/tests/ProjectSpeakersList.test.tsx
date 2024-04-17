import renderer from "react-test-renderer";

import ProjectSpeakersList, {
  AddSpeakerListItem,
  ProjectSpeakersId,
  SpeakerListItem,
} from "components/ProjectUsers/ProjectSpeakersList";
import { randomSpeaker } from "types/project";

// Dialog uses portals, which are not supported in react-test-renderer.
jest.mock("@mui/material/Dialog", () =>
  jest.requireActual("@mui/material/Container")
);

jest.mock("backend", () => ({
  createSpeaker: (name: string, projectId?: string) =>
    mockCreateSpeaker(name, projectId),
  deleteSpeaker: (speakerId: string, projectId?: string) =>
    mockDeleteSpeaker(speakerId, projectId),
  getAllSpeakers: (projectId?: string) => mockGetAllSpeakers(projectId),
  updateSpeakerName: (speakerId: string, name: string, projectId?: string) =>
    mockUpdateSpeakerName(speakerId, name, projectId),
}));
// Mock "i18n", else `Error: connect ECONNREFUSED ::1:80`
jest.mock("i18n", () => ({}));

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
  mockCreateSpeaker.mockResolvedValue("");
  mockGetAllSpeakers.mockResolvedValue(mockSpeakers);
  mockUpdateSpeakerName.mockResolvedValue("");
});

describe("ProjectSpeakersList", () => {
  it("shows right number of speakers and an item to add a speaker", async () => {
    await renderProjectSpeakersList();
    expect(testRenderer.root.findAllByType(SpeakerListItem)).toHaveLength(
      mockSpeakers.length
    );
    expect(testRenderer.root.findByType(AddSpeakerListItem)).toBeTruthy();
  });

  it("updates speaker name if changed", async () => {
    await renderProjectSpeakersList();

    // Click the button to edit speaker
    const editButton = testRenderer.root.findByProps({
      id: `${ProjectSpeakersId.ButtonEditPrefix}${mockSpeakers[0].id}`,
    });
    await renderer.act(() => {
      editButton.props.onClick();
    });

    // Submit the current name with extra whitespace
    const mockEvent = {
      preventDefault: jest.fn(),
      target: { value: `\t\t${mockSpeakers[0].name} ` },
    };
    await renderer.act(() => {
      testRenderer.root
        .findByProps({ id: ProjectSpeakersId.TextFieldEdit })
        .props.onChange(mockEvent);
    });
    await renderer.act(() => {
      testRenderer.root
        .findByProps({ id: ProjectSpeakersId.ButtonEditConfirm })
        .props.onClick();
    });

    // Ensure no name update was submitted
    expect(mockUpdateSpeakerName).not.toHaveBeenCalled();

    // Click the button to edit speaker
    await renderer.act(() => {
      editButton.props.onClick();
    });

    // Submit a new name
    const name = "Mr. Different";
    mockEvent.target.value = name;
    await renderer.act(() => {
      testRenderer.root
        .findByProps({ id: ProjectSpeakersId.TextFieldEdit })
        .props.onChange(mockEvent);
    });
    await renderer.act(() => {
      testRenderer.root
        .findByProps({ id: ProjectSpeakersId.ButtonEditConfirm })
        .props.onClick();
    });

    // Ensure the name update was submitted
    expect(mockUpdateSpeakerName.mock.calls[0][1]).toEqual(name);
  });

  it("trims whitespace when adding a speaker", async () => {
    await renderProjectSpeakersList();

    // Click the button to add a speaker
    await renderer.act(() => {
      testRenderer.root
        .findByProps({ id: ProjectSpeakersId.ButtonAdd })
        .props.onClick();
    });

    // Submit the name of the speaker with extra whitespace
    const name = "Ms. Nym";
    const mockEvent = {
      preventDefault: jest.fn(),
      target: { value: ` ${name}\t ` },
    };
    await renderer.act(() => {
      testRenderer.root
        .findByProps({ id: ProjectSpeakersId.TextFieldAdd })
        .props.onChange(mockEvent);
    });
    await renderer.act(() => {
      testRenderer.root
        .findByProps({ id: ProjectSpeakersId.ButtonAddConfirm })
        .props.onClick();
    });

    // Ensure new speaker was submitted with trimmed name
    expect(mockCreateSpeaker.mock.calls[0][0]).toEqual(name);
  });
});
