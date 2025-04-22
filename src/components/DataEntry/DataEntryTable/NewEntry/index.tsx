import { AutocompleteCloseReason, Grid, Typography } from "@mui/material";
import {
  CSSProperties,
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
import { NoteButton } from "components/Buttons";
import { focusInput } from "components/DataEntry/DataEntryTable";
import {
  DeleteEntry,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import VernDialog from "components/DataEntry/DataEntryTable/NewEntry/VernDialog";
import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import { type StoreState } from "rootRedux/types";
import theme from "types/theme";
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

const gridItemStyle = (spacing: number): CSSProperties => ({
  paddingInline: theme.spacing(spacing),
  position: "relative",
});

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
    focus(FocusTarget.Vernacular);
  }, [focus, resetNewEntry]);

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

  /** When the vern dialog is closed, focus needs to return to text fields.
   * The following sets a flag (shouldFocus) to be triggered by conditionalFocus(),
   * which is passed to each input component to call on update. */
  useEffect(() => {
    if (!vernOpen) {
      setShouldFocus(selectedDup ? FocusTarget.Gloss : FocusTarget.Vernacular);
    }
  }, [selectedDup, vernOpen]);

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

  const addNewEntryAndReset = async (): Promise<void> => {
    // Prevent double-submission
    if (submitting) {
      return;
    }
    setSubmitting(true);
    await addNewEntry();
    resetState();
  };

  const addOrUpdateWord = async (): Promise<void> => {
    if (suggestedDups.length) {
      // Case 1: Duplicate vern is typed
      if (!selectedDup) {
        // Case 1a: User hasn't made a selection
        setVernOpen(true);
      } else if (selectedDup.id) {
        // Case 1b: User has selected an entry to modify
        await updateWordWithNewGloss();
        resetState();
      } else {
        // Case 1c: User has selected new entry
        await addNewEntryAndReset();
      }
    } else {
      // Case 2: New vern is typed
      await addNewEntryAndReset();
    }
  };

  const handleGlossEnter = async (): Promise<void> => {
    // The user can never submit a new entry without a vernacular
    if (newVern) {
      await addOrUpdateWord();
    }
    focus(FocusTarget.Vernacular);
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
    <Grid alignItems="center" container id={NewEntryId.GridNewEntry}>
      <Grid container item xs={4} style={gridItemStyle(2)}>
        <Grid item xs={12}>
          <VernWithSuggestions
            isNew
            vernacular={newVern}
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
        </Grid>
      </Grid>
      <Grid item xs={4} style={gridItemStyle(1)}>
        <GlossWithSuggestions
          isNew
          gloss={newGloss}
          glossInput={glossInput}
          updateGlossField={setNewGloss}
          handleEnter={() => handleGlossEnter()}
          analysisLang={analysisLang}
          textFieldId={NewEntryId.TextFieldGloss}
          onUpdate={() => conditionalFocus(FocusTarget.Gloss)}
        />
      </Grid>
      <Grid item xs={1} style={gridItemStyle(1)}>
        {!selectedDup?.id && (
          // note is not available if user selected to modify an existing entry
          <NoteButton
            buttonId={NewEntryId.ButtonNote}
            noteText={newNote}
            updateNote={setNewNote}
          />
        )}
      </Grid>
      <Grid item xs={2} style={gridItemStyle(1)}>
        <PronunciationsFrontend
          audio={newAudio}
          deleteAudio={delNewAudio}
          replaceAudio={repNewAudio}
          uploadAudio={addNewAudio}
          onClick={() => focus(FocusTarget.Gloss)}
        />
      </Grid>
      <Grid item xs={1} style={gridItemStyle(1)}>
        <DeleteEntry
          buttonId={NewEntryId.ButtonDelete}
          removeEntry={() => resetState()}
        />
      </Grid>
      <EnterGrid />
    </Grid>
  );
}

function EnterGrid(): ReactElement {
  const { t } = useTranslation();
  return (
    <Grid item xs={12} style={{ paddingInlineStart: theme.spacing(2) }}>
      <Typography variant="body2">{t("addWords.pressEnter")}</Typography>
    </Grid>
  );
}
