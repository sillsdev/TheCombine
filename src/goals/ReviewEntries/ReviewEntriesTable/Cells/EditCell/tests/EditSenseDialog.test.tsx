import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { Project, type Sense } from "api/models";
import EditSenseDialog, {
  EditSenseDialogId,
  EditSenseDialogTextId,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditSenseDialog";
import { type StoreState, defaultState } from "rootRedux/types";
import { newDefinition, newGloss, newSense } from "types/word";
import { newWritingSystem } from "types/writingSystem";

const mockClose = jest.fn();
const mockSave = jest.fn();

type TextInput = HTMLInputElement | HTMLTextAreaElement;

interface MockStateProps {
  analysisLangs: string[];
  definitionsEnabled: boolean;
  grammaticalInfoEnabled: boolean;
}

const mockState = (props: MockStateProps): StoreState => {
  const { analysisLangs, ...rest } = props;
  const project: Project = {
    ...defaultState.currentProjectState.project,
    analysisWritingSystems: analysisLangs.map((l) => newWritingSystem(l, l)),
    ...rest,
  };
  return {
    ...defaultState,
    currentProjectState: { ...defaultState.currentProjectState, project },
  };
};

interface RenderEditSenseDialogOptions extends Partial<MockStateProps> {
  sense?: Sense;
}

const renderEditSenseDialog = async ({
  analysisLangs = ["en"],
  definitionsEnabled = false,
  grammaticalInfoEnabled = false,
  sense = newSense("gloss", analysisLangs[0]),
}: RenderEditSenseDialogOptions = {}): Promise<void> => {
  const mockStore = configureMockStore()(
    mockState({ analysisLangs, definitionsEnabled, grammaticalInfoEnabled })
  );
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <EditSenseDialog
          close={mockClose}
          isOpen
          save={mockSave}
          sense={sense}
        />
      </Provider>
    );
  });
};

const getCardRegion = (titleId: EditSenseDialogTextId): HTMLElement =>
  screen.getByText(titleId).closest('[role="region"]') as HTMLElement;

const getTextFields = (titleId: EditSenseDialogTextId): TextInput[] =>
  within(getCardRegion(titleId)).getAllByRole("textbox") as TextInput[];

const getTextFieldByLabel = (
  titleId: EditSenseDialogTextId,
  label: string
): TextInput =>
  within(getCardRegion(titleId)).getByLabelText(label) as TextInput;

const getGlossFields = (): TextInput[] =>
  getTextFields(EditSenseDialogTextId.CardGlosses);

const getDefinitionFields = (): TextInput[] =>
  getTextFields(EditSenseDialogTextId.CardDefinitions);

describe("EditSenseDialog", () => {
  describe("cancel and save buttons", () => {
    beforeEach(async () => {
      await renderEditSenseDialog();
    });

    test("cancel button closes if no changes", async () => {
      // Click the cancel button
      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonCancel));

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).not.toHaveBeenCalled();
    });

    test("cancel button opens dialog if changes", async () => {
      // Make a change
      await userEvent.type(getGlossFields()[0], "glossier");

      // Click the cancel button and cancel the cancel
      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonCancel));
      await userEvent.click(
        screen.getByTestId(EditSenseDialogId.ButtonCancelDialogCancel)
      );

      // Ensure nothing happened
      expect(mockClose).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();

      // Click the cancel button and confirm the cancel
      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonCancel));
      await userEvent.click(
        screen.getByTestId(EditSenseDialogId.ButtonCancelDialogConfirm)
      );

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).not.toHaveBeenCalled();
    });

    test("save button closes if no changes", async () => {
      // Click the save button
      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonSave));

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).not.toHaveBeenCalled();
    });

    test("save button saves changes and closes", async () => {
      // Make a change
      const glossField = getGlossFields()[0];
      await userEvent.clear(glossField);
      const newGlossText = "New gloss!";
      await userEvent.type(glossField, newGlossText);

      // Click the save button
      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonSave));

      // Ensure save and close occurred
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledTimes(1);
      const updatedSense: Sense = mockSave.mock.calls[0][0];
      expect(updatedSense.glosses[0].def).toEqual(newGlossText);
    });
  });

  describe("definitionsEnabled & grammaticalInfoEnabled", () => {
    const definitionsTitle = EditSenseDialogTextId.CardDefinitions;
    const partOfSpeechTitle = EditSenseDialogTextId.CardPartOfSpeech;

    test("show definitions when definitionsEnabled is true", async () => {
      await renderEditSenseDialog({ definitionsEnabled: true });
      expect(screen.queryByText(definitionsTitle)).toBeTruthy();
      expect(screen.queryByText(partOfSpeechTitle)).toBeNull();
    });

    test("show part of speech when grammaticalInfoEnabled is true", async () => {
      await renderEditSenseDialog({ grammaticalInfoEnabled: true });
      expect(screen.queryByText(definitionsTitle)).toBeNull();
      expect(screen.queryByText(partOfSpeechTitle)).toBeTruthy();
    });
  });

  describe("language ordering", () => {
    test("show glosses in analysis language order before other languages", async () => {
      await renderEditSenseDialog({
        analysisLangs: ["es", "en"],
        sense: {
          ...newSense(),
          glosses: [newGloss("sel", "fr"), newGloss("salt", "en")],
        },
      });

      const glossRegion = getCardRegion(EditSenseDialogTextId.CardGlosses);
      const glossFields = getGlossFields();

      expect(glossFields).toHaveLength(3);
      expect(glossFields[0]).toBe(within(glossRegion).getByLabelText("es"));
      expect(glossFields[1]).toBe(within(glossRegion).getByLabelText("en"));
      expect(glossFields[2]).toBe(within(glossRegion).getByLabelText("fr"));
      expect(glossFields.map((f) => f.value)).toEqual(["", "salt", "sel"]);
    });

    test("show definitions in analysis language order before other languages", async () => {
      await renderEditSenseDialog({
        analysisLangs: ["es", "en"],
        definitionsEnabled: true,
        sense: {
          ...newSense(),
          definitions: [
            newDefinition("sel", "fr"),
            newDefinition("salt", "en"),
          ],
        },
      });

      const defRegion = getCardRegion(EditSenseDialogTextId.CardDefinitions);
      const defFields = getDefinitionFields();
      expect(defFields).toHaveLength(3);
      expect(defFields[0]).toBe(within(defRegion).getByLabelText("es"));
      expect(defFields[1]).toBe(within(defRegion).getByLabelText("en"));
      expect(defFields[2]).toBe(within(defRegion).getByLabelText("fr"));
      expect(defFields.map((f) => f.value)).toEqual(["", "salt", "sel"]);
    });

    test("save keeps other-language glosses when editing an inserted analysis field", async () => {
      await renderEditSenseDialog({
        analysisLangs: ["en", "es"],
        sense: { ...newSense(), glosses: [newGloss("sel", "fr")] },
      });
      await userEvent.type(
        getTextFieldByLabel(EditSenseDialogTextId.CardGlosses, "es"),
        "sal"
      );
      expect(mockClose).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();

      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonSave));

      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledTimes(1);
      const updatedSense: Sense = mockSave.mock.calls[0][0];
      const expectedGlosses = [newGloss("sal", "es"), newGloss("sel", "fr")];
      expect(updatedSense.glosses).toEqual(expectedGlosses);
    });
  });
});
