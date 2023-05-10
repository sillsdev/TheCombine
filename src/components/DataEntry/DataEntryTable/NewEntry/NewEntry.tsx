import { AutocompleteCloseReason, Grid, Typography } from "@mui/material";
import {
  createRef,
  CSSProperties,
  KeyboardEvent,
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Key } from "ts-key-enum";

import { SemanticDomain, Word, WritingSystem } from "api/models";
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
import { newNote, newSense, newWord } from "types/word";
import { firstGlossText } from "types/wordUtilities";
import { LevenshteinDistance } from "utilities";

const idAffix = "new-entry";

export enum FocusTarget {
  Gloss,
  Vernacular,
}

const getVernSuggestions = (
  vern: string,
  allVerns: string[],
  dist: (a: string, b: string) => number
): string[] => {
  if (!vern || !allVerns.length) {
    return [];
  }
  const maxSuggestions = 5;
  const maxDistance = 3;

  const verns = allVerns
    .filter((v) => v.startsWith(vern))
    .sort((a, b) => a.length - b.length);
  // Take 2 shortest and the rest longest (should make finding the long words easier).
  if (verns.length > maxSuggestions) {
    verns.splice(2, verns.length - maxSuggestions);
  }

  if (verns.length < maxSuggestions) {
    const viableVerns = allVerns
      .filter((v) => dist(v, vern) < maxDistance)
      .sort((a, b) => dist(a, vern) - dist(b, vern));
    let candidate: string;
    while (verns.length < maxSuggestions && viableVerns.length) {
      candidate = viableVerns.shift()!;
      if (!verns.includes(candidate)) {
        verns.push(candidate);
      }
    }
  }
  return verns;
};

const gridItemStyle = (spacing: number): CSSProperties => ({
  paddingLeft: theme.spacing(spacing),
  paddingRight: theme.spacing(spacing),
  position: "relative",
});

interface NewEntryProps {
  allWords: Word[];
  defunctWordIds: string[];
  updateWordWithNewGloss: (
    wordId: string,
    gloss: string,
    audioFileURLs: string[]
  ) => void;
  addNewWord: (newEntry: Word, newAudio: string[]) => void;
  semanticDomain: SemanticDomain;
  setIsReadyState: (isReady: boolean) => void;
  recorder?: Recorder;
  analysisLang: WritingSystem;
  vernacularLang: WritingSystem;
  newAudioUrls: string[];
  addNewAudioUrl: (file: File) => void;
  delNewAudioUrl: (url: string) => void;
  newEntry: Word;
  setNewEntry: (word: Word) => void;
  vernInput: RefObject<HTMLDivElement>;
}

/**
 * Displays data related to creating a new word entry
 */
export default function NewEntry(props: NewEntryProps): ReactElement {
  const isTreeOpen = useSelector(
    (state: StoreState) => state.treeViewState.open
  );

  const [activeGloss, setActiveGloss] = useState("");
  const [allVerns, setAllVerns] = useState<string[]>([]);
  const [dupVernWords, setDupVernWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | undefined>();
  const [senseOpen, setSenseOpen] = useState(false);
  const [shouldFocus, setShouldFocus] = useState<FocusTarget | undefined>();
  const [suggestedVerns, setSuggestedVerns] = useState<string[]>([]);
  const [vernOpen, setVernOpen] = useState(false);

  const glossInput = createRef<HTMLDivElement>();
  const levDistance = new LevenshteinDistance();

  const focus = useCallback(
    (target: FocusTarget): void => {
      switch (target) {
        case FocusTarget.Gloss:
          focusInput(glossInput);
          return;
        case FocusTarget.Vernacular:
          focusInput(props.vernInput);
          return;
      }
    },
    [glossInput, props.vernInput]
  );

  const resetState = useCallback((): void => {
    setDupVernWords([]);
    setSelectedWord(undefined);
    setSuggestedVerns([]);
    focus(FocusTarget.Vernacular);
    // May need to reset newEntry and newAudioUrls in the parent component.
  }, [focus, setDupVernWords, setSelectedWord, setSuggestedVerns]);

  useEffect(() => {
    if (isTreeOpen) {
      resetState();
    }
  }, [isTreeOpen, resetState]);

  useEffect(() => {
    const vernsWithDups = props.allWords.map((w) => w.vernacular);
    setAllVerns([...new Set(vernsWithDups)]);
  }, [props.allWords, setAllVerns]);

  /** When the vern/sense dialogs are closed, focus needs to return to text fields.
   * The following sets a flag (shouldFocus) to be triggered by conditionalFocus(),
   * which is passed to each input component to call on update. */
  useEffect(() => {
    if (!(senseOpen || vernOpen)) {
      setShouldFocus(selectedWord ? FocusTarget.Gloss : FocusTarget.Vernacular);
    }
  }, [selectedWord, senseOpen, vernOpen]);

  useEffect(() => {
    if (props.newEntry.senses.length) {
      setActiveGloss(props.newEntry.senses[0].glosses[0].def);
    }
  }, [props.newEntry.senses, setActiveGloss]);

  /** This function is for a child input component to call on update
   * to move focus to itself, if shouldFocus says it should. */
  const conditionalFocus = (target: FocusTarget): void => {
    if (shouldFocus === target) {
      focus(target);
      setShouldFocus(undefined);
    }
  };

  const updateGlossField = (gloss: string): void => {
    const s = newSense(gloss, props.analysisLang.bcp47, props.semanticDomain);
    props.setNewEntry({ ...props.newEntry, senses: [s] });
  };

  const updateVernField = (vern: string, openVernDialog?: boolean): void => {
    if (vern !== props.newEntry.vernacular) {
      vern = vern.trim();
      setSelectedWord(undefined);
      props.setIsReadyState(vern.length > 0);
      setSuggestedVerns(
        getVernSuggestions(vern, allVerns, levDistance.getDistance)
      );
      let vernWords: Word[] = [];
      if (vern) {
        // Weed out any words that are already being edited
        vernWords = props.allWords.filter(
          (w) => w.vernacular === vern && !props.defunctWordIds.includes(w.id)
        );
      }
      setDupVernWords(vernWords);
      props.setNewEntry({ ...props.newEntry, vernacular: vern });
    }
    if (openVernDialog) {
      conditionalOpenVernDialog();
    }
  };

  const conditionalOpenVernDialog = (): void => {
    if (dupVernWords.length && !selectedWord) {
      setVernOpen(true);
    }
  };

  const updateNote = (text: string): void => {
    const note = newNote(text, props.analysisLang.bcp47);
    props.setNewEntry({ ...props.newEntry, note });
  };

  const addNewWordAndReset = (): void => {
    const senses = props.newEntry.senses.length
      ? props.newEntry.senses
      : [newSense("", props.analysisLang.bcp47, props.semanticDomain)];
    props.addNewWord({ ...props.newEntry, senses }, props.newAudioUrls);
    resetState();
    props.setNewEntry(newWord());
  };

  const addOrUpdateWord = (): void => {
    if (dupVernWords.length) {
      // Duplicate vern ...
      if (!selectedWord) {
        // ... and user hasn't made a selection
        setVernOpen(true);
      } else if (selectedWord.id) {
        // ... and user has selected an entry to modify
        props.updateWordWithNewGloss(
          selectedWord.id,
          activeGloss,
          props.newAudioUrls
        );
        resetState();
      } else {
        // ... and user has selected new entry
        addNewWordAndReset();
      }
    } else {
      // New Vern is typed
      addNewWordAndReset();
    }
  };

  const handleEnter = (e: KeyboardEvent, checkGloss: boolean): void => {
    if (!vernOpen && e.key === Key.Enter) {
      // The user can never submit a new entry without a vernacular
      if (props.newEntry.vernacular) {
        // The user can conditionally submit a new entry without a gloss
        if (activeGloss || !checkGloss) {
          addOrUpdateWord();
          focus(FocusTarget.Vernacular);
        } else {
          focus(FocusTarget.Gloss);
        }
      } else {
        focus(FocusTarget.Vernacular);
      }
    }
  };

  const handleCloseVernDialog = (selectedWordId?: string): void => {
    if (selectedWordId === "") {
      setSelectedWord(newWord(props.newEntry.vernacular));
      setSenseOpen(false);
    } else if (selectedWordId) {
      setSelectedWord(
        dupVernWords.find((word: Word) => word.id === selectedWordId)
      );
      setSenseOpen(true);
    } else {
      setSenseOpen(false);
    }
    setVernOpen(false);
  };

  const handleCloseSenseDialog = (senseIndex?: number): void => {
    if (senseIndex === undefined) {
      setSelectedWord(undefined);
      setVernOpen(true);
    } else if (senseIndex >= 0) {
      // SenseDialog can only be open when selectedWord is defined.
      const gloss = firstGlossText(selectedWord!.senses[senseIndex]);
      updateGlossField(gloss);
    } // The remaining case, senseIndex===-1, indicates new sense for the selectedWord.
    setSenseOpen(false);
  };

  return (
    <Grid container id={idAffix} alignItems="center">
      <Grid container item xs={4} style={gridItemStyle(2)}>
        <Grid item xs={12}>
          <VernWithSuggestions
            isNew
            vernacular={props.newEntry.vernacular}
            vernInput={props.vernInput}
            updateVernField={(newValue: string, openDialog?: boolean) =>
              updateVernField(newValue, openDialog)
            }
            onBlur={conditionalOpenVernDialog}
            onClose={(_, reason: AutocompleteCloseReason) => {
              // Handle if the user fully types an identical vernacular to a suggestion
              // and selects it from the Autocomplete. This should open the dialog.
              switch (reason) {
                case "selectOption":
                  // User pressed Enter or Left Click on an item.
                  conditionalOpenVernDialog();
                  break;
                default:
                  // If the user Escapes out of the Autocomplete, do nothing.
                  break;
              }
            }}
            suggestedVerns={suggestedVerns}
            // To prevent unintentional no-gloss submissions:
            // If enter pressed from the vern field, check whether gloss is empty
            handleEnterAndTab={(e: KeyboardEvent) => handleEnter(e, true)}
            vernacularLang={props.vernacularLang}
            textFieldId={`${idAffix}-vernacular`}
            onUpdate={() => conditionalFocus(FocusTarget.Vernacular)}
          />
          <VernDialog
            open={vernOpen}
            handleClose={(selectedWordId?: string) =>
              handleCloseVernDialog(selectedWordId)
            }
            vernacularWords={dupVernWords}
            analysisLang={props.analysisLang.bcp47}
          />
          {selectedWord && (
            <SenseDialog
              selectedWord={selectedWord}
              open={senseOpen}
              handleClose={(senseIndex?: number) =>
                handleCloseSenseDialog(senseIndex)
              }
              analysisLang={props.analysisLang.bcp47}
            />
          )}
        </Grid>
      </Grid>
      <Grid item xs={4} style={gridItemStyle(1)}>
        <GlossWithSuggestions
          isNew
          gloss={activeGloss}
          glossInput={glossInput}
          updateGlossField={(newValue: string) => updateGlossField(newValue)}
          handleEnterAndTab={(e: KeyboardEvent) =>
            // To allow intentional no-gloss submissions:
            // If enter pressed from the gloss field,
            // don't check whether gloss is empty
            handleEnter(e, false)
          }
          analysisLang={props.analysisLang}
          textFieldId={`${idAffix}-gloss`}
          onUpdate={() => conditionalFocus(FocusTarget.Gloss)}
        />
      </Grid>
      <Grid item xs={1} style={gridItemStyle(1)}>
        {!selectedWord?.id && (
          // note is not available if user selected to modify an exiting entry
          <EntryNote
            noteText={props.newEntry.note.text}
            updateNote={(text: string) => updateNote(text)}
            buttonId="note-entry-new"
          />
        )}
      </Grid>
      <Grid item xs={2} style={gridItemStyle(1)}>
        <Pronunciations
          wordId={""}
          pronunciationFiles={props.newAudioUrls}
          recorder={props.recorder}
          deleteAudio={(_, fileName: string) => props.delNewAudioUrl(fileName)}
          uploadAudio={(_, audioFile: File) => props.addNewAudioUrl(audioFile)}
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
