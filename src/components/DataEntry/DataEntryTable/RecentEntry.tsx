import { Grid2 } from "@mui/material";
import { ReactElement, memo, useState } from "react";

import { Pronunciation, Word, WritingSystem } from "api/models";
import NoteButton from "components/Buttons/NoteButton";
import {
  DeleteEntry,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
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
  delAudioFromWord: (wordId: string, fileName: string) => void;
  repAudioInWord: (wordId: string, audio: Pronunciation) => void;
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
  const [editing, setEditing] = useState(false);
  const [gloss, setGloss] = useState(
    firstGlossText(sense, props.analysisLang.bcp47)
  );
  const [vernacular, setVernacular] = useState(props.entry.vernacular);

  const updateGlossField = (gloss: string): void => {
    setEditing(gloss !== firstGlossText(sense, props.analysisLang.bcp47));
    setGloss(gloss);
  };
  const updateVernField = (vern: string): void => {
    setEditing(vern !== props.entry.vernacular);
    setVernacular(vern);
  };

  function conditionallyUpdateGloss(): void {
    if (firstGlossText(sense, props.analysisLang.bcp47) !== gloss) {
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
    <Grid2
      alignItems="center"
      container
      id={`${idAffix}-${props.rowIndex}`}
      spacing={1}
    >
      <Grid2 size={4} sx={{ px: 1 }}>
        <VernWithSuggestions
          vernacular={vernacular}
          isDisabled={props.disabled || props.entry.senses.length > 1}
          updateVernField={updateVernField}
          onBlur={() => conditionallyUpdateVern()}
          handleEnter={() => {
            vernacular && props.focusNewEntry();
          }}
          vernacularLang={props.vernacularLang}
          textFieldId={`${idAffix}-${props.rowIndex}-vernacular`}
        />
      </Grid2>

      <Grid2 size={4} sx={{ px: 1 }}>
        <GlossWithSuggestions
          gloss={gloss}
          isDisabled={props.disabled}
          updateGlossField={updateGlossField}
          onBlur={() => conditionallyUpdateGloss()}
          handleEnter={() => {
            gloss && props.focusNewEntry();
          }}
          analysisLang={props.analysisLang}
          textFieldId={`${idAffix}-${props.rowIndex}-gloss`}
        />
      </Grid2>

      <Grid2 size={1}>
        <NoteButton
          disabled={editing || props.disabled}
          noteText={props.entry.note.text}
          updateNote={handleUpdateNote}
          buttonId={`${idAffix}-${props.rowIndex}-note`}
        />
      </Grid2>

      <Grid2 size={2}>
        <PronunciationsBackend
          audio={props.entry.audio}
          disabled={editing || props.disabled}
          wordId={props.entry.id}
          deleteAudio={(fileName) => {
            props.delAudioFromWord(props.entry.id, fileName);
          }}
          replaceAudio={(audio) => props.repAudioInWord(props.entry.id, audio)}
          uploadAudio={(file) => {
            props.addAudioToWord(props.entry.id, file);
          }}
        />
      </Grid2>

      <Grid2 size={1}>
        <DeleteEntry
          removeEntry={handleRemoveEntry}
          buttonId={`${idAffix}-${props.rowIndex}-delete`}
          confirmId={"addWords.deleteRowWarning"}
          disabled={editing || props.disabled}
        />
      </Grid2>
    </Grid2>
  );
}

export default memo(RecentEntry);
