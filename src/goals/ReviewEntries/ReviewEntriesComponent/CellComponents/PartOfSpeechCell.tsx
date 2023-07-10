import { Grid } from "@mui/material";
import { ReactElement } from "react";

import { PartOfSpeechButton } from "components/Buttons";
import AlignedList from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

interface PartOfSpeechCellProps {
  rowData: ReviewEntriesWord;
}

export default function PartOfSpeechCell(
  props: PartOfSpeechCellProps,
): ReactElement {
  return (
    <AlignedList
      key={`partOfSpeechCell:${props.rowData.id}`}
      listId={`partsOfSpeech${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, senseIndex) => (
        <Grid container direction="row" spacing={2} key={senseIndex}>
          <PartOfSpeechButton
            buttonId={`sense-${sense.guid}-part-of-speech`}
            gramInfo={sense.partOfSpeech}
          />
        </Grid>
      ))}
    />
  );
}
