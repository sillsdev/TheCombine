import { Card, CardContent, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { Word } from "api/models";
import { FlagButton } from "components/Buttons";
import { EntryNote } from "components/DataEntry/DataEntryTable/EntryCellComponents";
import { PronunciationsBackend } from "components/Pronunciations/PronunciationsBackend";
import SenseCard from "components/WordCard/SenseCard";
import { TypographyWithFont } from "utilities/fontComponents";
import { getDateTimeString } from "utilities/utilities";

interface WordCardProps {
  languages?: string[];
  provenance?: boolean;
  word: Word;
}

export default function WordCard(props: WordCardProps): ReactElement {
  const { languages, provenance, word } = props;
  const { audio, flag, id, note, senses } = word;
  const created = new Date(word.created);
  const modified = new Date(word.modified);
  const { t } = useTranslation();

  const sep = { date: "/", dateTime: " ", time: ":" };

  return (
    <Card style={{ backgroundColor: "lightgray" }}>
      <CardContent style={{ position: "relative", paddingRight: 40 }}>
        {/* Vernacular */}
        <TypographyWithFont variant="h5" vernacular>
          {word.vernacular}
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
          <SenseCard
            key={s.guid}
            languages={languages}
            provenance={provenance}
            sense={s}
          />
        ))}
        {/* Audio playback. */}
        {audio.length > 0 && (
          <PronunciationsBackend
            deleteAudio={() => {}}
            playerOnly
            pronunciationFiles={audio}
            wordId={id}
          />
        )}
        {/* Timestamps */}
        {provenance && (
          <Typography>
            {t("wordHistory.wordId", { val: id })}
            <br />
            {t("wordHistory.wordCreated", {
              val: getDateTimeString(created, sep),
            })}
            <br />
            {t("wordHistory.wordModified", {
              val: getDateTimeString(modified, sep),
            })}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
