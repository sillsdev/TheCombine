import { CloseFullscreen, OpenInFull, PlayArrow } from "@mui/icons-material";
import {
  Badge,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { Word } from "api/models";
import { FlagButton, IconButtonWithTooltip } from "components/Buttons";
import { EntryNote } from "components/DataEntry/DataEntryTable/EntryCellComponents";
import { PronunciationsBackend } from "components/Pronunciations/PronunciationsBackend";
import SenseCard from "components/WordCard/SenseCard";
import { themeColors } from "types/theme";
import { TypographyWithFont } from "utilities/fontComponents";
import { friendlySep, getDateTimeString } from "utilities/utilities";

interface WordCardProps {
  languages?: string[];
  provenance?: boolean;
  word: Word;
}

export default function WordCard(props: WordCardProps): ReactElement {
  const { languages, provenance, word } = props;
  const { audio, flag, id, note, senses } = word;
  const [full, setFull] = useState(false);
  const { t } = useTranslation();

  return (
    <Card style={{ backgroundColor: "lightgray" }}>
      <CardContent style={{ position: "relative", paddingRight: 40 }}>
        {/* Vernacular */}
        <TypographyWithFont variant="h5" vernacular>
          {word.vernacular}
        </TypographyWithFont>
        {/* Icons for note & flag (if any). */}
        <div style={{ position: "absolute", right: 0, top: 0 }}>
          {!full && audio.length > 0 && (
            <IconButton>
              <Badge badgeContent={audio.length}>
                <PlayArrow style={{ color: themeColors.success }} />
              </Badge>
            </IconButton>
          )}
          {!!note.text && (
            <EntryNote buttonId={`word-${id}-note`} noteText={note.text} />
          )}
          {flag.active && (
            <FlagButton flag={flag} buttonId={`word-${id}-flag`} />
          )}
          {full ? (
            <IconButtonWithTooltip
              buttonId={`word-${word.id}-collapse`}
              icon={<CloseFullscreen />}
              onClick={() => setFull(false)}
            />
          ) : (
            <IconButtonWithTooltip
              buttonId={`word-${word.id}-expand`}
              icon={<OpenInFull />}
              onClick={() => setFull(true)}
            />
          )}
        </div>
        {/* Senses. */}
        {full || senses.length <= 2 ? (
          senses.map((s) => (
            <SenseCard
              key={s.guid}
              languages={languages}
              minimal={!full}
              provenance={provenance}
              sense={s}
            />
          ))
        ) : senses.length > 2 ? (
          <>
            <SenseCard
              key={senses[0].guid}
              languages={languages}
              minimal={!full}
              provenance={provenance}
              sense={senses[0]}
            />
            <Card style={{ backgroundColor: "white" }}>
              <Typography variant="h6">{`+${
                senses.length - 1
              } more senses`}</Typography>
            </Card>
          </>
        ) : null}
        {/* Audio playback. */}
        {audio.length > 0 && full && (
          <PronunciationsBackend
            deleteAudio={() => {}}
            playerOnly
            pronunciationFiles={audio}
            wordId={id}
          />
        )}
        {/* Timestamps */}
        {provenance && (
          <Typography display="block" variant="caption">
            {t("wordHistory.wordId", { val: id })}
            {full && <br />}
            {full &&
              t("wordHistory.wordCreated", {
                val: getDateTimeString(word.created, friendlySep),
              })}
            <br />
            {t("wordHistory.wordModified", {
              val: getDateTimeString(word.modified, friendlySep),
            })}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
