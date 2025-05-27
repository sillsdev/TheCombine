import { CloseFullscreen, OpenInFull, PlayArrow } from "@mui/icons-material";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Fragment, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Word } from "api/models";
import { getUser } from "backend";
import {
  FlagButton,
  IconButtonWithTooltip,
  NoteButton,
} from "components/Buttons";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
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

/** Text for the aria-label of WordCard elements */
export enum WordCardLabel {
  ButtonAudioSummary = "Recorded pronunciations",
  ButtonCondense = "Condense senses",
  ButtonExpand = "Expand senses",
  ButtonFlag = "Entry flag",
  ButtonNote = "Note text",
}

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

  /** Flag summary icon (disabled button) */
  const flagIcon = (
    <FlagButton buttonLabel={WordCardLabel.ButtonFlag} flag={flag} />
  );

  /** Note summary icon (disabled button) */
  const noteIcon = (
    <NoteButton buttonLabel={WordCardLabel.ButtonNote} noteText={note.text} />
  );

  /** Vernacular */
  const title = (
    <TypographyWithFont variant="h5" vernacular>
      {word.vernacular}
    </TypographyWithFont>
  );

  /** Icons/buttons beside vernacular */
  const action = (
    <>
      {/* Condensed audio, note, flag */}
      {!full && (
        <>
          <AudioSummary count={audio.length} />
          {!!note.text && noteIcon}
          {flag.active && flagIcon}
        </>
      )}
      {/* Button for condense/expand */}
      <IconButtonWithTooltip
        buttonId={buttonIdFull(word.id)}
        buttonLabel={
          full ? WordCardLabel.ButtonCondense : WordCardLabel.ButtonExpand
        }
        icon={
          full ? (
            <CloseFullscreen sx={{ color: (t) => t.palette.grey[900] }} />
          ) : (
            <OpenInFull sx={{ color: (t) => t.palette.grey[600] }} />
          )
        }
        onClick={() => setFull(!full)}
      />
    </>
  );

  return (
    <Card
      sx={{ backgroundColor: (t) => t.palette.grey[300], minWidth: "200px" }}
    >
      <CardHeader action={action} sx={{ paddingBottom: 0 }} title={title} />
      <CardContent>
        {/* Expanded audio, note, flag */}
        {full && (
          <>
            {audio.length > 0 && (
              <PronunciationsBackend audio={audio} playerOnly wordId={id} />
            )}
            {!!note.text && (
              <div style={{ display: "block" }}>
                {noteIcon}
                <Typography display="inline">{note.text}</Typography>
              </div>
            )}
            {flag.active && (
              <div style={{ display: "block" }}>
                {flagIcon}
                <Typography display="inline">{flag.text}</Typography>
              </div>
            )}
          </>
        )}

        {/* Senses */}
        {full ? (
          <Stack spacing={1}>
            {senses.map((s) => (
              <SenseCard
                key={s.guid}
                languages={languages}
                provenance={provenance}
                sense={s}
              />
            ))}
          </Stack>
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
    <IconButton aria-label={WordCardLabel.ButtonAudioSummary} disabled>
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
