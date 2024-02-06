import { CloseFullscreen, OpenInFull, PlayArrow } from "@mui/icons-material";
import {
  Badge,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import { Fragment, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Word } from "api/models";
import { getUser } from "backend";
import { FlagButton, IconButtonWithTooltip } from "components/Buttons";
import { EntryNote } from "components/DataEntry/DataEntryTable/EntryCellComponents";
import { PronunciationsBackend } from "components/Pronunciations/PronunciationsBackend";
import SenseCard from "components/WordCard/SenseCard";
import SummarySenseCard from "components/WordCard/SummarySenseCard";
import { TypographyWithFont } from "utilities/fontComponents";
import { friendlySep, getDateTimeString } from "utilities/utilities";

interface WordCardProps {
  languages?: string[];
  provenance?: boolean;
  word: Word;
}

export const buttonIdFull = (wordId: string): string => `word-${wordId}-full`;

export default function WordCard(props: WordCardProps): ReactElement {
  const { languages, provenance, word } = props;
  const { audio, editedBy, flag, id, note, senses } = word;
  const [full, setFull] = useState(false);
  const [username, setUsername] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (provenance && editedBy?.length) {
      getUser(editedBy[editedBy.length - 1]).then((u) =>
        setUsername(u.username)
      );
    }
  }, [editedBy, provenance]);

  return (
    <Card
      sx={{ backgroundColor: (t) => t.palette.grey[300], minWidth: "200px" }}
    >
      <CardContent sx={{ position: "relative" }}>
        {/* Vernacular */}
        <TypographyWithFont variant="h5" vernacular>
          {word.vernacular}
        </TypographyWithFont>

        <div style={{ position: "absolute", right: 0, top: 0 }}>
          {/* Condensed audio, note, flag */}
          {!full && (
            <>
              <AudioSummary count={audio.length} />
              {!!note.text && <EntryNote noteText={note.text} />}
              {flag.active && <FlagButton flag={flag} />}
            </>
          )}
          {/* Button for expand/condense */}
          <IconButtonWithTooltip
            buttonId={buttonIdFull(word.id)}
            icon={
              full ? (
                <CloseFullscreen sx={{ color: (t) => t.palette.grey[900] }} />
              ) : (
                <OpenInFull sx={{ color: (t) => t.palette.grey[600] }} />
              )
            }
            onClick={() => setFull(!full)}
          />
        </div>

        {/* Expanded audio, note, flag */}
        {full && (
          <>
            {audio.length > 0 && (
              <PronunciationsBackend audio={audio} playerOnly wordId={id} />
            )}
            {!!note.text && (
              <div style={{ display: "block" }}>
                <EntryNote noteText={note.text} />
                <Typography display="inline">{note.text}</Typography>
              </div>
            )}
            {flag.active && (
              <div style={{ display: "block" }}>
                <FlagButton flag={flag} />
                <Typography display="inline">{flag.text}</Typography>
              </div>
            )}
          </>
        )}

        {/* Senses */}
        {full ? (
          senses.map((s) => (
            <SenseCard
              key={s.guid}
              languages={languages}
              provenance={provenance}
              sense={s}
            />
          ))
        ) : (
          <SummarySenseCard senses={senses} />
        )}

        {/* Timestamps */}
        {provenance && (
          <Typography display="block" variant="caption">
            {t("wordCard.wordId", { val: id })}
            <br />
            {t("wordCard.wordModified", {
              val: getDateTimeString(word.modified, friendlySep),
            })}
            {!!username && (
              <>
                <br />
                {t("wordCard.user", { val: username })}
              </>
            )}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function AudioSummary(props: { count: number }): ReactElement {
  return props.count > 0 ? (
    <IconButton disabled>
      <Badge
        badgeContent={props.count}
        sx={{ color: (t) => t.palette.common.black }}
      >
        <PlayArrow sx={{ color: (t) => t.palette.success.main }} />
      </Badge>
    </IconButton>
  ) : (
    <Fragment />
  );
}
