import { Edit } from "@mui/icons-material";
import { Grid2 } from "@mui/material";
import { ReactElement, memo } from "react";
import { useTranslation } from "react-i18next";

import { Word, WritingSystem } from "api/models";
import NoteButton from "components/Buttons/NoteButton";
import { RecentEntryIdPrefix } from "components/DataEntry/DataEntryTable/RecentEntry";
import { AudioSummary } from "components/WordCard";
import { TypographyWithFont } from "utilities/fontComponents";
import { firstGlossText } from "utilities/wordUtilities";

export enum RecentEntryColdTextId {
  IconEdit = "addWords.editRow",
}

export interface RecentEntryColdProps {
  analysisLang: WritingSystem;
  entry: Word;
  rowIndex: number;
  senseGuid: string;
}

/** Displays a recently entered word that a user cannot edit. */
export function RecentEntryCold(props: RecentEntryColdProps): ReactElement {
  const { t } = useTranslation();

  const sense = props.entry.senses.find((s) => s.guid === props.senseGuid);
  const gloss = sense ? firstGlossText(sense, props.analysisLang.bcp47) : "";

  return (
    <Grid2
      alignItems="center"
      container
      id={`${RecentEntryIdPrefix.Row}${props.rowIndex}`}
      spacing={1}
    >
      <Grid2 size={4} sx={{ px: 1 }}>
        <TypographyWithFont vernacular>
          {props.entry.vernacular}
        </TypographyWithFont>
      </Grid2>

      <Grid2 size={4} sx={{ px: 1 }}>
        <TypographyWithFont analysis lang={props.analysisLang.bcp47}>
          {gloss}
        </TypographyWithFont>
      </Grid2>

      <Grid2 size={1}>
        {!!props.entry.note.text && (
          <NoteButton
            buttonId={`${RecentEntryIdPrefix.ButtonNote}${props.rowIndex}`}
            disabled
            noteText={props.entry.note.text}
          />
        )}
      </Grid2>

      <Grid2 size={2}>
        <AudioSummary count={props.entry.audio.length} />
      </Grid2>

      <Grid2 size={1}>
        {/* Decorative affordance: the whole row is the clickable edit target. */}
        <Edit
          aria-hidden={false}
          aria-label={t(RecentEntryColdTextId.IconEdit)}
          role="img"
        />
      </Grid2>
    </Grid2>
  );
}

export default memo(RecentEntryCold);
