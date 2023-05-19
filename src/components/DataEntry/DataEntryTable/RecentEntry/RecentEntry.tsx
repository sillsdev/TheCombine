import { Grid } from "@mui/material";
import { ReactElement, useState } from "react";

import { Word, WritingSystem } from "api/models";
import {
  DeleteEntry,
  EntryNote,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import Pronunciations from "components/Pronunciations/PronunciationsComponent";
import Recorder from "components/Pronunciations/Recorder";
import theme from "types/theme";
import { newGloss } from "types/word";
import { firstGlossText } from "utilities/wordUtilities";

const idAffix = "recent-entry";

interface RecentEntryProps {
  rowIndex: number;
  entry: Word;
  senseGuid: string;
  updateGloss: (gloss: string) => void;
  updateNote: (newText: string) => Promise<void>;
  updateVern: (newVernacular: string, targetWordId?: string) => void;
  removeEntry: () => void;
  addAudioToWord: (wordId: string, audioFile: File) => void;
  deleteAudioFromWord: (wordId: string, fileName: string) => void;
  recorder: Recorder;
  focusNewEntry: () => void;
  analysisLang: WritingSystem;
  vernacularLang: WritingSystem;
  disabled?: boolean;
}

/**
 * Displays a recently entered word that a user can still edit
 */
export default function RecentEntry(props: RecentEntryProps): ReactElement {
  const sense = props.entry.senses.find((s) => s.guid === props.senseGuid)!;
  if (sense.glosses.length < 1) {
    sense.glosses.push(newGloss("", props.analysisLang.bcp47));
  }
  const [gloss, setGloss] = useState(firstGlossText(sense));
  const [hovering, setHovering] = useState(false);
  const [vernacular, setVernacular] = useState(props.entry.vernacular);

  function conditionallyUpdateGloss(): void {
    if (firstGlossText(sense) !== gloss) {
      props.updateGloss(gloss);
    }
  }

  function conditionallyUpdateVern(): void {
    if (props.entry.vernacular !== vernacular) {
      props.updateVern(vernacular);
    }
  }

  return (
    <Grid
      id={`${idAffix}-${props.rowIndex}`}
      container
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      alignItems="center"
    >
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
          handleEnterAndTab={() => {
            if (vernacular) {
              props.focusNewEntry();
            }
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
          handleEnterAndTab={() => {
            if (gloss) {
              props.focusNewEntry();
            }
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
            updateNote={props.updateNote}
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
          <Pronunciations
            wordId={props.entry.id}
            pronunciationFiles={props.entry.audio}
            recorder={props.recorder}
            deleteAudio={(wordId: string, fileName: string) => {
              props.deleteAudioFromWord(wordId, fileName);
            }}
            uploadAudio={(wordId: string, audioFile: File) => {
              props.addAudioToWord(wordId, audioFile);
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
        {!props.disabled && hovering && (
          <DeleteEntry
            removeEntry={() => props.removeEntry()}
            buttonId={`${idAffix}-${props.rowIndex}-delete`}
            confirmId={"addWords.deleteRowWarning"}
            wordId={props.entry.id}
          />
        )}
      </Grid>
    </Grid>
  );
}
