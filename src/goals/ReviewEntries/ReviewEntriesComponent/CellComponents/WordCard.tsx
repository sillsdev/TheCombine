import { Card, CardContent } from "@mui/material";
import { ReactElement } from "react";

import { Word } from "api/models";
import { FlagButton } from "components/Buttons";
import { EntryNote } from "components/DataEntry/DataEntryTable/EntryCellComponents";
import { PronunciationsBackend } from "components/Pronunciations/PronunciationsBackend";
import SenseCard from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCardText";
import { TypographyWithFont } from "utilities/fontComponents";

interface WordCardProps {
  word: Word;
  languages?: string[];
}

export default function WordCard(props: WordCardProps): ReactElement {
  const { audio, flag, id, note, senses, vernacular } = props.word;
  return (
    <Card style={{ backgroundColor: "lightgray" }}>
      <CardContent style={{ position: "relative", paddingRight: 40 }}>
        {/* Vernacular */}
        <TypographyWithFont variant="h5" vernacular>
          {vernacular}
        </TypographyWithFont>
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
