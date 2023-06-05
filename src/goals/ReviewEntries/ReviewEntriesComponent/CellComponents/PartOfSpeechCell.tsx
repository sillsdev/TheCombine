import { Chip, Grid } from "@mui/material";
import { Fragment, ReactElement } from "react";

import { GramCatGroup, GrammaticalInfo } from "api/models";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { themeColors } from "types/theme";

interface PartOfSpeechCellProps {
  rowData: ReviewEntriesWord;
  sortingByThis?: boolean;
  editGramInfo?: (guid: string, newGramInfo: GrammaticalInfo) => void;
}

export default function PartOfSpeechCell(
  props: PartOfSpeechCellProps
): ReactElement {
  function getChipStyle(senseIndex: number): { backgroundColor?: string } {
    return props.sortingByThis && senseIndex === 0
      ? { backgroundColor: themeColors.highlight as string }
      : {};
  }

  return (
    <AlignedList
      key={`partOfSpeechCell:${props.rowData.id}`}
      listId={`partsOfSpeech${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, senseIndex) => (
        <Grid container direction="row" spacing={2} key={senseIndex}>
          {sense.partOfSpeech.catGroup !== GramCatGroup.Unspecified ? (
            <Chip
              color={sense.deleted ? "secondary" : "default"}
              style={getChipStyle(senseIndex)}
              label={`${sense.partOfSpeech.catGroup}: ${sense.partOfSpeech.grammaticalCategory}`}
              onDelete={
                props.editGramInfo && !sense.deleted ? () => {} : undefined
              }
              id={`sense-${sense.guid}-part-of-speech`}
            />
          ) : (
            <Fragment />
          )}
        </Grid>
      ))}
      bottomCell={props.editGramInfo ? SPACER : undefined}
    />
  );
}
