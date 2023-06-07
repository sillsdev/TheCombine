import { Grid } from "@mui/material";
import { ReactElement, useState } from "react";

import { GrammaticalInfo } from "api/models";
import PartOfSpeechButton from "components/Buttons/PartOfSpeechButton";
import AlignedList, {
  SPACER,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

interface PartOfSpeechCellProps {
  rowData: ReviewEntriesWord;
  editGramInfo?: (guid: string, newGramInfo: GrammaticalInfo) => void;
}

export default function PartOfSpeechCell(
  props: PartOfSpeechCellProps
): ReactElement {
  const [open, setOpen] = useState(false);

  const onClick = props.editGramInfo ? (): void => setOpen(true) : undefined;

  return (
    <AlignedList
      key={`partOfSpeechCell:${props.rowData.id}`}
      listId={`partsOfSpeech${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, senseIndex) => (
        <Grid container direction="row" spacing={2} key={senseIndex}>
          <PartOfSpeechButton
            buttonId={`sense-${sense.guid}-part-of-speech`}
            gramInfo={sense.partOfSpeech}
            onClick={onClick}
          />
        </Grid>
      ))}
      bottomCell={props.editGramInfo ? SPACER : undefined}
    />
  );
}
