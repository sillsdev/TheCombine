import "@testing-library/jest-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProjectSpeakersList, {
  ProjectSpeakersId,
} from "components/ProjectUsers/ProjectSpeakersList";
import { randomSpeaker } from "types/project";

jest.mock("backend", () => ({
  createSpeaker: (name: string, projectId?: string) =>
    mockCreateSpeaker(name, projectId),
  deleteSpeaker: (speakerId: string, projectId?: string) =>
    mockDeleteSpeaker(speakerId, projectId),
  getAllSpeakers: (projectId?: string) => mockGetAllSpeakers(projectId),
  updateSpeakerName: (speakerId: string, name: string, projectId?: string) =>
    mockUpdateSpeakerName(speakerId, name, projectId),
}));
jest.mock("i18n", () => ({})); // else `thrown: "Error: AggregateError`

const mockCreateSpeaker = jest.fn();
const mockDeleteSpeaker = jest.fn();
const mockGetAllSpeakers = jest.fn();
const mockUpdateSpeakerName = jest.fn();

const mockProjId = "mock-project-id";
const mockSpeakers = [randomSpeaker(), randomSpeaker(), randomSpeaker()];

const renderProjectSpeakersList = async (): Promise<void> => {
  await act(async () => {
    render(<ProjectSpeakersList projectId={mockProjId} />);
  });
};

beforeEach(() => {
  mockCreateSpeaker.mockResolvedValue("");
  mockGetAllSpeakers.mockResolvedValue(mockSpeakers);
  mockUpdateSpeakerName.mockResolvedValue("");
});

const typeInDialogAndConfirm = async (text: string): Promise<void> => {
  const dialog = screen.getByRole("dialog");
  await userEvent.type(within(dialog).getByRole("textbox"), text);
  await userEvent.click(within(dialog).getByText("buttons.confirm"));
};

describe("ProjectSpeakersList", () => {
  it("shows list item for each speakers, +1 for add-a-speaker", async () => {
    await renderProjectSpeakersList();
    expect(screen.queryAllByRole("listitem")).toHaveLength(
      mockSpeakers.length + 1
    );
  });

  it("updates speaker name if changed", async () => {
    await renderProjectSpeakersList();
    const speaker = mockSpeakers[0];

    // Click the button to edit speaker
    const editButton = screen.getByTestId(
      `${ProjectSpeakersId.ButtonEditPrefix}${speaker.id}`
    );
    await userEvent.click(editButton);

    // Add whitespace to the current name
    await typeInDialogAndConfirm("  ");

    // Ensure no name update was submitted
    expect(mockUpdateSpeakerName).not.toHaveBeenCalled();

    // Click the button to edit speaker
    await userEvent.click(editButton);

    // Add non-whitespace
    await typeInDialogAndConfirm("!");

    // Ensure the name update was submitted
    expect(mockUpdateSpeakerName.mock.calls[0][1]).toEqual(`${speaker.name}!`);
  });

  it("trims whitespace when adding a speaker", async () => {
    await renderProjectSpeakersList();

    // Click the button to add a speaker
    await userEvent.click(screen.getByTestId(ProjectSpeakersId.ButtonAdd));

    // Submit the name of the speaker with extra whitespace
    const name = "Ms. Nym";
    await typeInDialogAndConfirm(` ${name}\t `);

    // Ensure new speaker was submitted with trimmed name
    expect(mockCreateSpeaker.mock.calls[0][0]).toEqual(name);
  });
});
