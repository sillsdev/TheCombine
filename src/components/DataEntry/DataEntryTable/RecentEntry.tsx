import { Grid } from "@mui/material";
import { ReactElement, memo, useState } from "react";

import { Word, WritingSystem } from "api/models";
import {
  DeleteEntry,
  EntryNote,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import theme from "types/theme";
import { FileWithSpeakerId, newGloss } from "types/word";
import { firstGlossText } from "utilities/wordUtilities";

const idAffix = "recent-entry";

export interface RecentEntryProps {
  rowIndex: number;
  entry: Word;
  senseGuid: string;
  updateGloss: (index: number, gloss: string) => void;
  updateNote: (index: number, newText: string) => Promise<void>;
  updateVern: (index: number, newVern: string, targetWordId?: string) => void;
  removeEntry: (index: number) => void;
  addAudioToWord: (wordId: string, file: FileWithSpeakerId) => void;
  deleteAudioFromWord: (wordId: string, fileName: string) => void;
  focusNewEntry: () => void;
  analysisLang: WritingSystem;
  vernacularLang: WritingSystem;
  disabled?: boolean;
}

/**
 * Displays a recently entered word that a user can still edit
 */
export function RecentEntry(props: RecentEntryProps): ReactElement {
  const sense = props.entry.senses.find((s) => s.guid === props.senseGuid)!;
  if (sense.glosses.length < 1) {
    sense.glosses.push(newGloss("", props.analysisLang.bcp47));
  }
  const [gloss, setGloss] = useState(firstGlossText(sense));
  const [vernacular, setVernacular] = useState(props.entry.vernacular);

  function conditionallyUpdateGloss(): void {
    if (firstGlossText(sense) !== gloss) {
      props.updateGloss(props.rowIndex, gloss);
    }
  }

  function conditionallyUpdateVern(): void {
    if (vernacular.trim()) {
      if (props.entry.vernacular !== vernacular) {
        props.updateVern(props.rowIndex, vernacular);
      }
    } else {
      setVernacular(props.entry.vernacular);
    }
  }

  const handleRemoveEntry = (): void => props.removeEntry(props.rowIndex);
  const handleUpdateNote = (noteText: string): Promise<void> =>
    props.updateNote(props.rowIndex, noteText);

  return (
    <Grid alignItems="center" container id={`${idAffix}-${props.rowIndex}`}>
      <Grid
        item
        xs={4}
        style={{
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          position: "relative",
        }}
      >
        <VernWithSuggestions
          vernacular={vernacular}
          isDisabled={props.disabled || props.entry.senses.length > 1}
          updateVernField={setVernacular}
          onBlur={() => conditionallyUpdateVern()}
          handleEnter={() => {
            vernacular && props.focusNewEntry();
          }}
          vernacularLang={props.vernacularLang}
          textFieldId={`${idAffix}-${props.rowIndex}-vernacular`}
        />
      </Grid>
      <Grid
        item
        xs={4}
        style={{
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          position: "relative",
        }}
      >
        <GlossWithSuggestions
          gloss={gloss}
          isDisabled={props.disabled}
          updateGlossField={setGloss}
          onBlur={() => conditionallyUpdateGloss()}
          handleEnter={() => {
            gloss && props.focusNewEntry();
          }}
          analysisLang={props.analysisLang}
          textFieldId={`${idAffix}-${props.rowIndex}-gloss`}
        />
      </Grid>
      <Grid
        item
        xs={1}
        style={{
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
          position: "relative",
        }}
      >
        {!props.disabled && (
          <EntryNote
            noteText={props.entry.note.text}
            updateNote={handleUpdateNote}
            buttonId={`${idAffix}-${props.rowIndex}-note`}
          />
        )}
      </Grid>
      <Grid
        item
        xs={2}
        style={{
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
          position: "relative",
        }}
      >
        {!props.disabled && (
          <PronunciationsBackend
            audio={props.entry.audio}
            wordId={props.entry.id}
            deleteAudio={(fileName: string) => {
              props.deleteAudioFromWord(props.entry.id, fileName);
            }}
            uploadAudio={(file: FileWithSpeakerId) => {
              props.addAudioToWord(props.entry.id, file);
            }}
          />
        )}
      </Grid>
      <Grid
        item
        xs={1}
        style={{
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
          position: "relative",
        }}
      >
        {!props.disabled && (
          <DeleteEntry
            removeEntry={handleRemoveEntry}
            buttonId={`${idAffix}-${props.rowIndex}-delete`}
            confirmId={"addWords.deleteRowWarning"}
            wordId={props.entry.id}
          />
        )}
      </Grid>
    </Grid>
  );
}

export default memo(RecentEntry);
