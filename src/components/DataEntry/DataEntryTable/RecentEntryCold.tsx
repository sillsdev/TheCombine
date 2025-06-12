import { Edit } from "@mui/icons-material";
import { Grid2 } from "@mui/material";
import { ReactElement, memo } from "react";

import { Word, WritingSystem } from "api/models";
import { NoteButton } from "components/Buttons";
import { AudioSummary } from "components/WordCard";
import theme from "types/theme";
import { TypographyWithFont } from "utilities/fontComponents";
import { firstGlossText } from "utilities/wordUtilities";

const idAffix = "recent-entry";

export interface RecentEntryColdProps {
  analysisLang: WritingSystem;
  entry: Word;
  rowIndex: number;
  senseGuid: string;
}

/** Displays a recently entered word that a user cannot edit. */
export function RecentEntryCold(props: RecentEntryColdProps): ReactElement {
  const sense = props.entry.senses.find((s) => s.guid === props.senseGuid);
  const gloss = sense ? firstGlossText(sense, props.analysisLang.bcp47) : "";

  return (
    <Grid2 alignItems="center" container id={`${idAffix}-${props.rowIndex}`}>
      <Grid2
        size={4}
        style={{ paddingInline: theme.spacing(2), position: "relative" }}
      >
        <TypographyWithFont vernacular>
          {props.entry.vernacular}
        </TypographyWithFont>
      </Grid2>

      <Grid2
        size={4}
        style={{ paddingInline: theme.spacing(2), position: "relative" }}
      >
        <TypographyWithFont analysis lang={props.analysisLang.bcp47}>
          {gloss}
        </TypographyWithFont>
      </Grid2>

      <Grid2
        size={1}
        style={{ paddingInline: theme.spacing(1), position: "relative" }}
      >
        {props.entry.note.text ? (
          <NoteButton disabled noteText={props.entry.note.text} />
        ) : null}
      </Grid2>

      <Grid2
        size={1}
        style={{ paddingInline: theme.spacing(1), position: "relative" }}
      >
        <AudioSummary count={props.entry.audio.length} />
      </Grid2>

      <Grid2 size={1} />

      <Grid2
        size={1}
        style={{ paddingInline: theme.spacing(1), position: "relative" }}
      >
        <Edit />
      </Grid2>
    </Grid2>
  );
}

export default memo(RecentEntryCold);
