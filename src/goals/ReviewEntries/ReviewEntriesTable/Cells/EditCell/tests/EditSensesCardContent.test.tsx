import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GramCatGroup, Sense, Status } from "api/models";
import EditSensesCardContent, {
  EditSensesId,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditSensesCardContent";
import { newSemanticDomain } from "types/semanticDomain";
import { newDefinition, newSense } from "types/word";

jest.mock("components/WordCard/SenseCard");
jest.mock(
  "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditSenseDialog"
);

const mockMoveSense = jest.fn();
const mockToggleSenseDeleted = jest.fn();
const mockUpdateOrAddSense = jest.fn();

const mockSenseGuids = ["guid1", "guid2", "guid3", "guid4"];
const mockSenses = (): Sense[] => [
  {
    ...newSense("gloss 1"),
    definitions: [newDefinition("def A", "aa"), newDefinition("def B", "bb")],
    guid: mockSenseGuids[0],
  },
  {
    ...newSense("gloss 2"),
    guid: mockSenseGuids[1],
    semanticDomains: [newSemanticDomain("2.2", "two-point-two")],
  },
  {
    ...newSense("gloss 3"),
    accessibility: Status.Protected,
    guid: mockSenseGuids[2],
  },
  {
    ...newSense("gloss 4"),
    grammaticalInfo: {
      catGroup: GramCatGroup.Verb,
      grammaticalCategory: "vt",
    },
    guid: mockSenseGuids[3],
  },
];

const renderEditSensesCardContent = async (showSenses = true): Promise<void> =>
  await act(async () => {
    render(
      <EditSensesCardContent
        moveSense={(from: number, to: number) => mockMoveSense(from, to)}
        newSenses={mockSenses()}
        oldSenses={mockSenses()}
        showSenses={showSenses}
        toggleSenseDeleted={mockToggleSenseDeleted}
        updateOrAddSense={mockUpdateOrAddSense}
      />
    );
  });

beforeEach(async () => {
  jest.clearAllMocks();
});

describe("EditSensesCardContent", () => {
  it("renders sense summary", async () => {
    await renderEditSensesCardContent(false);
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("renders senses", async () => {
    await renderEditSensesCardContent(true);
    expect(screen.queryByRole("list")).toBeTruthy();
    expect(screen.queryAllByRole("listitem")).toHaveLength(4);
  });

  describe("up/down buttons", () => {
    beforeEach(async () => {
      await renderEditSensesCardContent();
    });

    const sensesCount = mockSenses().length;

    for (let i = 0; i < sensesCount; i++) {
      test(`move ${i} up`, async () => {
        const testId = EditSensesId.ButtonSenseBumpUpPrefix + mockSenseGuids[i];
        if (i) {
          await userEvent.click(screen.getByTestId(testId));
          expect(mockMoveSense).toHaveBeenCalledTimes(1);
          expect(mockMoveSense).toHaveBeenCalledWith(i, i - 1);
        } else {
          expect(screen.getByTestId(testId)).toBeDisabled();
        }
      });

      test(`move ${i} down`, async () => {
        const testId =
          EditSensesId.ButtonSenseBumpDownPrefix + mockSenseGuids[i];
        if (i < sensesCount - 1) {
          await userEvent.click(screen.getByTestId(testId));
          expect(mockMoveSense).toHaveBeenCalledTimes(1);
          expect(mockMoveSense).toHaveBeenCalledWith(i, i + 1);
        } else {
          expect(screen.getByTestId(testId)).toBeDisabled();
        }
      });
    }
  });
});
