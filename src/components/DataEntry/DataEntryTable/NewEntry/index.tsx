import { AutocompleteCloseReason, Grid2, Typography } from "@mui/material";
import {
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Pronunciation, Word, WritingSystem } from "api/models";
import NoteButton from "components/Buttons/NoteButton";
import {
  DeleteEntry,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import VernDialog from "components/DataEntry/DataEntryTable/NewEntry/VernDialog";
import { focusInput } from "components/DataEntry/utilities";
import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import { type StoreState } from "rootRedux/types";
import { FileWithSpeakerId } from "types/word";

export enum NewEntryId {
  ButtonDelete = "new-entry-delete-button",
  ButtonNote = "new-entry-note-button",
  GridNewEntry = "new-entry",
  TextFieldGloss = "new-entry-gloss-textfield",
  TextFieldVern = "new-entry-vernacular-textfield",
}

export enum FocusTarget {
  Gloss,
  Vernacular,
}

interface NewEntryProps {
  analysisLang: WritingSystem;
  vernacularLang: WritingSystem;
  // Parent component handles new entry state:
  addNewEntry: () => Promise<void>;
  resetNewEntry: () => void;
  updateWordWithNewGloss: () => Promise<void>;
  newAudio: Pronunciation[];
  addNewAudio: (file: FileWithSpeakerId) => void;
  delNewAudio: (url: string) => void;
  repNewAudio: (audio: Pronunciation) => void;
  newGloss: string;
  setNewGloss: (gloss: string) => void;
  newNote: string;
  setNewNote: (note: string) => void;
  newVern: string;
  setNewVern: (vern: string) => void;
  vernInput: RefObject<HTMLInputElement>;
  // Parent component handles vern suggestion state:
  selectedDup?: Word;
  setSelectedDup: (id?: string) => void;
  setSelectedSense: (guid?: string) => void;
  suggestedVerns: string[];
  suggestedDups: Word[];
}

/**
 * Displays data related to creating a new word entry
 */
export default function NewEntry(props: NewEntryProps): ReactElement {
  const {
    analysisLang,
    vernacularLang,
    // Parent component handles new entry state:
    addNewEntry,
    resetNewEntry,
    updateWordWithNewGloss,
    newAudio,
    addNewAudio,
    delNewAudio,
    repNewAudio,
    newGloss,
    setNewGloss,
    newNote,
    setNewNote,
    newVern,
    setNewVern,
    vernInput,
    // Parent component handles vern suggestion state:
    selectedDup,
    setSelectedDup,
    setSelectedSense,
    suggestedVerns,
    suggestedDups,
  } = props;

  const isTreeOpen = useSelector(
    (state: StoreState) => state.treeViewState.open
  );

  const [shouldFocus, setShouldFocus] = useState<FocusTarget | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [vernOpen, setVernOpen] = useState(false);
  const [wasTreeClosed, setWasTreeClosed] = useState(false);

  const glossInput = useRef<HTMLInputElement>(null);

  const focus = useCallback(
    (target: FocusTarget): void => {
      switch (target) {
        case FocusTarget.Gloss:
          focusInput(glossInput);
          return;
        case FocusTarget.Vernacular:
          focusInput(vernInput);
          return;
      }
    },
    [glossInput, vernInput]
  );

  const resetState = useCallback((): void => {
    resetNewEntry();
    setSubmitting(false);
    setVernOpen(false);
    // Do not use focus(FocusTarget.Vernacular) here.
    // That allows typing atop the previous vernacular.
  }, [resetNewEntry]);

  /** Reset when tree opens, except for the first time it is open. */
  useEffect(() => {
    if (isTreeOpen) {
      if (wasTreeClosed) {
        resetState();
      }
      setWasTreeClosed(false);
    } else {
      setWasTreeClosed(true);
    }
  }, [isTreeOpen, resetState, wasTreeClosed]);

  /** When the vern dialog is closed or submission completed,
   * focus needs to return to text fields.
   * This sets a flag (shouldFocus) to be triggered by conditionalFocus(),
   * which is passed to each input component to call on update. */
  useEffect(() => {
    if (!submitting && !vernOpen) {
      setShouldFocus(selectedDup ? FocusTarget.Gloss : FocusTarget.Vernacular);
    }
  }, [selectedDup, submitting, vernOpen]);

  /** This function is for a child input component to call on update
   * to move focus to itself, if shouldFocus says it should. */
  const conditionalFocus = (target: FocusTarget): void => {
    if (shouldFocus === target) {
      focus(target);
      setShouldFocus(undefined);
    }
  };

  const updateVernField = (vern: string, openVernDialog?: boolean): void => {
    setNewVern(vern);
    setVernOpen(!!openVernDialog);
  };

  const addOrUpdateWord = async (): Promise<void> => {
    if (suggestedDups.length) {
      // Case 1: Duplicate vern is typed
      if (!selectedDup) {
        // Case 1a: User hasn't made a selection (should never happen,
        // since submission is only triggered from the gloss field,
        // but left here in case that changes)
        setVernOpen(true);
        setSubmitting(false);
        return;
      } else if (selectedDup.id) {
        // Case 1b: User has selected an entry to modify
        await updateWordWithNewGloss();
      } else {
        // Case 1c: User has selected new entry
        await addNewEntry();
      }
    } else {
      // Case 2: New vern is typed
      await addNewEntry();
    }
    resetState();
  };

  const handleGlossEnter = async (): Promise<void> => {
    // The user can never submit a new entry without a vernacular
    if (newVern) {
      // Blur to prevent double-submission or extending submitted gloss.
      glossInput.current?.blur();
      setSubmitting(true);
      await addOrUpdateWord();
    } else {
      focus(FocusTarget.Vernacular);
    }
  };

  /** Clear the duplicate selection if user returns to the vernacular field. */
  const handleOnVernFocus = (): void => {
    if (selectedDup) {
      setSelectedDup();
    }
  };

  const handleCloseVernDialog = (wordId?: string, senseId?: string): void => {
    if (wordId !== undefined) {
      setSelectedDup(wordId);
      setSelectedSense(senseId);
    } else {
      // User closed the dialog without choosing a duplicate entry or new entry.
      // Highlight-select the typed vernacular for easy deletion.
      vernInput.current?.setSelectionRange(0, vernInput.current.value.length);
    }
    setVernOpen(false);
  };

  return (
    <Grid2
      alignItems="center"
      container
      id={NewEntryId.GridNewEntry}
      spacing={1}
    >
      <Grid2 size={4}>
        <VernWithSuggestions
          isNew
          vernacular={submitting ? "" : newVern}
          vernInput={vernInput}
          updateVernField={(newValue: string, openDialog?: boolean) =>
            updateVernField(newValue, openDialog)
          }
          onBlur={() => setVernOpen(true)}
          onClose={(_, reason: AutocompleteCloseReason) => {
            // Handle if the user fully types an identical vernacular to a suggestion
            // and selects it from the Autocomplete. This should open the dialog.
            if (reason === "selectOption") {
              // User pressed Enter or Left Click on an item.
              setVernOpen(true);
            }
          }}
          onFocus={handleOnVernFocus}
          suggestedVerns={suggestedVerns}
          // To prevent unintentional no-gloss or wrong-gloss submissions
          // and to simplify interactions with Autocomplete and with the dialogs:
          // if Enter is pressed from the vern field, move focus to gloss field.
          handleEnter={() => focus(FocusTarget.Gloss)}
          vernacularLang={vernacularLang}
          textFieldId={NewEntryId.TextFieldVern}
          onUpdate={() => conditionalFocus(FocusTarget.Vernacular)}
        />
        <VernDialog
          open={vernOpen && !!suggestedDups.length && !selectedDup}
          handleClose={handleCloseVernDialog}
          vernacularWords={suggestedDups}
          analysisLang={analysisLang.bcp47}
        />
      </Grid2>

      <Grid2 size={4}>
        <GlossWithSuggestions
          isNew
          gloss={submitting ? "" : newGloss}
          glossInput={glossInput}
          updateGlossField={setNewGloss}
          handleEnter={() => handleGlossEnter()}
          analysisLang={analysisLang}
          textFieldId={NewEntryId.TextFieldGloss}
          onUpdate={() => conditionalFocus(FocusTarget.Gloss)}
        />
      </Grid2>

      <Grid2 size={1}>
        {!selectedDup?.id && (
          // note is not available if user selected to modify an existing entry
          <NoteButton
            buttonId={NewEntryId.ButtonNote}
            noteText={submitting ? "" : newNote}
            onExited={() => setTimeout(() => focus(FocusTarget.Gloss), 10)}
            updateNote={setNewNote}
          />
        )}
      </Grid2>

      <Grid2 size={2}>
        <PronunciationsFrontend
          audio={submitting ? [] : newAudio}
          deleteAudio={delNewAudio}
          replaceAudio={repNewAudio}
          uploadAudio={addNewAudio}
          onClick={() => focus(FocusTarget.Gloss)}
        />
      </Grid2>

      <Grid2 size={1}>
        <DeleteEntry
          buttonId={NewEntryId.ButtonDelete}
          removeEntry={() => {
            resetState();
            focus(FocusTarget.Vernacular);
          }}
        />
      </Grid2>

      <EnterGrid />
    </Grid2>
  );
}

function EnterGrid(): ReactElement {
  const { t } = useTranslation();
  return (
    <Grid2 size={12} sx={{ paddingInlineStart: 1 }}>
      <Typography variant="body2">{t("addWords.pressEnter")}</Typography>
    </Grid2>
  );
}
