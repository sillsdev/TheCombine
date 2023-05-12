import { AutocompleteCloseReason, Grid, Typography } from "@mui/material";
import {
  CSSProperties,
  KeyboardEvent,
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Key } from "ts-key-enum";

import { Word, WritingSystem } from "api/models";
import { focusInput } from "components/DataEntry/DataEntryTable/DataEntryTable";
import {
  DeleteEntry,
  EntryNote,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import SenseDialog from "components/DataEntry/DataEntryTable/NewEntry/SenseDialog";
import VernDialog from "components/DataEntry/DataEntryTable/NewEntry/VernDialog";
import Pronunciations from "components/Pronunciations/PronunciationsComponent";
import Recorder from "components/Pronunciations/Recorder";
import { StoreState } from "types";
import theme from "types/theme";

const idAffix = "new-entry";

export enum FocusTarget {
  Gloss,
  Vernacular,
}

const gridItemStyle = (spacing: number): CSSProperties => ({
  paddingLeft: theme.spacing(spacing),
  paddingRight: theme.spacing(spacing),
  position: "relative",
});

interface NewEntryProps {
  analysisLang: WritingSystem;
  vernacularLang: WritingSystem;
  recorder?: Recorder;
  // Parent component handles new entry state:
  addNewEntry: () => Promise<void>;
  updateWordWithNewGloss: (wordId: string) => Promise<void>;
  newAudioUrls: string[];
  addNewAudioUrl: (file: File) => void;
  delNewAudioUrl: (url: string) => void;
  newGloss: string;
  setNewGloss: (gloss: string) => void;
  newNote: string;
  setNewNote: (note: string) => void;
  newVern: string;
  setNewVern: (vern: string) => void;
  vernInput: RefObject<HTMLDivElement>;
  // Parent component handles vern suggestion state:
  selectedDup?: Word;
  setSelectedDup: (id?: string) => void;
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
    recorder,
    // Parent component handles new entry state:
    addNewEntry,
    updateWordWithNewGloss,
    newAudioUrls,
    addNewAudioUrl,
    delNewAudioUrl,
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
    suggestedVerns,
    suggestedDups,
  } = props;

  const isTreeOpen = useSelector(
    (state: StoreState) => state.treeViewState.open
  );

  const [senseOpen, setSenseOpen] = useState(false);
  const [shouldFocus, setShouldFocus] = useState<FocusTarget | undefined>();
  const [vernOpen, setVernOpen] = useState(false);
  const [wasTreeClosed, setWasTreeClosed] = useState(false);

  const glossInput = useRef<HTMLDivElement>(null);

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
    setNewGloss("");
    setNewNote("");
    setNewVern("");
    setVernOpen(false);
    // May also need to reset newAudioUrls in the parent component.
    focus(FocusTarget.Vernacular);
  }, [focus, setNewGloss, setNewNote, setNewVern, setVernOpen]);

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

  /** When the vern/sense dialogs are closed, focus needs to return to text fields.
   * The following sets a flag (shouldFocus) to be triggered by conditionalFocus(),
   * which is passed to each input component to call on update. */
  useEffect(() => {
    if (!(senseOpen || vernOpen)) {
      setShouldFocus(selectedDup ? FocusTarget.Gloss : FocusTarget.Vernacular);
    }
  }, [selectedDup, senseOpen, vernOpen]);

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
    await addNewEntry();
    resetState();
  };

  const addOrUpdateWord = async (): Promise<void> => {
    if (suggestedDups.length) {
      // Duplicate vern ...
      if (!selectedDup) {
        // ... and user hasn't made a selection
        setVernOpen(true);
      } else if (!selectedDup.id) {
        // ... and user has selected an entry to modify
        await updateWordWithNewGloss(selectedDup.id);
        resetState();
      } else {
        // ... and user has selected new entry
        await addNewEntryAndReset();
      }
    } else {
      // New vern is typed
      await addNewEntryAndReset();
    }
  };

  const handleEnter = async (
    e: KeyboardEvent,
    checkGloss: boolean
  ): Promise<void> => {
    console.info(vernOpen);
    if ((true || !vernOpen) && e.key === Key.Enter) {
      // The user can never submit a new entry without a vernacular
      if (newVern) {
        // The user can conditionally submit a new entry without a gloss
        if (newGloss || !checkGloss) {
          await addOrUpdateWord();
          focus(FocusTarget.Vernacular);
        } else {
          focus(FocusTarget.Gloss);
        }
      } else {
        focus(FocusTarget.Vernacular);
      }
    }
  };

  const handleCloseVernDialog = (id?: string): void => {
    if (id !== undefined) {
      setSelectedDup(id);
    }

    if (id) {
      setSenseOpen(true);
    }

    setVernOpen(false);
  };

  const handleCloseSenseDialog = (gloss?: string): void => {
    if (gloss) {
      setNewGloss(gloss);
    } else if (gloss === undefined) {
      // If gloss is undefined, the user exited the dialog without a selection.
      setSelectedDup();
      setVernOpen(true);
    }
    // else: an empty string indicates new sense for the selectedWord.

    setSenseOpen(false);
  };

  return (
    <Grid container id={idAffix} alignItems="center">
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
            suggestedVerns={suggestedVerns}
            // To prevent unintentional no-gloss submissions:
            // If enter pressed from the vern field, check whether gloss is empty
            handleEnterAndTab={(e: KeyboardEvent) => handleEnter(e, true)}
            vernacularLang={vernacularLang}
            textFieldId={`${idAffix}-vernacular`}
            onUpdate={() => conditionalFocus(FocusTarget.Vernacular)}
          />
          <VernDialog
            open={vernOpen && !!suggestedDups.length && !selectedDup}
            handleClose={handleCloseVernDialog}
            vernacularWords={suggestedDups}
            analysisLang={analysisLang.bcp47}
          />
          {selectedDup && (
            <SenseDialog
              selectedWord={selectedDup}
              open={senseOpen}
              handleClose={handleCloseSenseDialog}
              analysisLang={analysisLang.bcp47}
            />
          )}
        </Grid>
      </Grid>
      <Grid item xs={4} style={gridItemStyle(1)}>
        <GlossWithSuggestions
          isNew
          gloss={newGloss}
          glossInput={glossInput}
          updateGlossField={setNewGloss}
          // To allow intentional no-gloss submissions:
          // If enter pressed from the gloss field, don't check whether gloss is empty
          handleEnterAndTab={(e: KeyboardEvent) => handleEnter(e, false)}
          analysisLang={analysisLang}
          textFieldId={`${idAffix}-gloss`}
          onUpdate={() => conditionalFocus(FocusTarget.Gloss)}
        />
      </Grid>
      <Grid item xs={1} style={gridItemStyle(1)}>
        {!selectedDup?.id && (
          // note is not available if user selected to modify an exiting entry
          <EntryNote
            noteText={newNote}
            updateNote={setNewNote}
            buttonId="note-entry-new"
          />
        )}
      </Grid>
      <Grid item xs={2} style={gridItemStyle(1)}>
        <Pronunciations
          wordId={""}
          pronunciationFiles={newAudioUrls}
          recorder={recorder}
          deleteAudio={(_, fileName: string) => delNewAudioUrl(fileName)}
          uploadAudio={(_, audioFile: File) => addNewAudioUrl(audioFile)}
          getAudioUrl={(_, fileName: string) => fileName}
        />
      </Grid>
      <Grid item xs={1} style={gridItemStyle(1)}>
        <DeleteEntry
          removeEntry={() => resetState()}
          buttonId={`${idAffix}-delete`}
        />
      </Grid>
      <EnterGrid />
    </Grid>
  );
}

function EnterGrid(): ReactElement {
  const { t } = useTranslation();
  return (
    <Grid item xs={12} style={{ paddingLeft: theme.spacing(2) }}>
      <Typography variant="caption">{t("addWords.pressEnter")}</Typography>
    </Grid>
  );
}
