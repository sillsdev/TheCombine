import { Card, CardContent, CardHeader } from "@mui/material";
import { ReactElement } from "react";

import { Word } from "api/models";
import { FlagButton } from "components/Buttons";
import { EntryNote } from "components/DataEntry/DataEntryTable/EntryCellComponents";
import { PronunciationsBackend } from "components/Pronunciations/PronunciationsBackend";
import SenseCard from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCardText";

interface WordCardProps {
  word: Word;
  languages?: string[];
}

export default function WordCard(props: WordCardProps): ReactElement {
  const { audio, flag, id, note, senses, vernacular } = props.word;
  return (
    <Card>
      <CardHeader>{vernacular}</CardHeader>
      <CardContent style={{ position: "relative", paddingRight: 40 }}>
        {/* Icons for note & flag (if any). */}
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          {!!note.text && (
            <EntryNote buttonId={`word-${id}-note`} noteText={note.text} />
          )}
          {flag.active && (
            <FlagButton flag={flag} buttonId={`word-${id}-flag`} />
          )}
        </div>
        {/* Senses. */}
        {senses.map((s) => (
          <SenseCard key={s.guid} languages={props.languages} sense={s} />
        ))}
        {/* Audio playback. */}
        <PronunciationsBackend
          deleteAudio={() => {}}
          playerOnly
          pronunciationFiles={audio}
          wordId={id}
        />
      </CardContent>
    </Card>
  );
}
