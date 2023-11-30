import { Grid } from "@mui/material";
import { ReactElement } from "react";

import { PartOfSpeechButton } from "components/Buttons";
import AlignedList from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/AlignedList";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesTypes";

interface PartOfSpeechCellProps {
  rowData: ReviewEntriesWord;
}

export default function PartOfSpeechCell(
  props: PartOfSpeechCellProps
): ReactElement {
  return (
    <AlignedList
      listId={`partsOfSpeech${props.rowData.id}`}
      contents={props.rowData.senses.map((sense) => (
        <Grid container direction="row" key={sense.guid} spacing={2}>
          <PartOfSpeechButton
            buttonId={`sense-${sense.guid}-part-of-speech`}
            gramInfo={sense.partOfSpeech}
          />
        </Grid>
      ))}
    />
  );
}
