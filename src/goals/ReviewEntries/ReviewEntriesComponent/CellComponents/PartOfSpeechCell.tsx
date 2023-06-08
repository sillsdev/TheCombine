import { Grid } from "@mui/material";
import { ReactElement, useState } from "react";

import { GrammaticalInfo } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import { EditPartOfSpeechDialog } from "components/Dialogs";
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
  return (
    <AlignedList
      key={`partOfSpeechCell:${props.rowData.id}`}
      listId={`partsOfSpeech${props.rowData.id}`}
      contents={props.rowData.senses.map((sense, senseIndex) => (
        <Grid container direction="row" spacing={2} key={senseIndex}>
          <SensePartOfSpeech
            guid={sense.guid}
            gramInfo={sense.partOfSpeech}
            editGramInfo={props.editGramInfo}
          />
        </Grid>
      ))}
      bottomCell={props.editGramInfo ? SPACER : undefined}
    />
  );
}

interface SensePartOfSpeechProps {
  guid: string;
  gramInfo: GrammaticalInfo;
  editGramInfo?: (guid: string, info: GrammaticalInfo) => void;
}

function SensePartOfSpeech(props: SensePartOfSpeechProps): ReactElement {
  const [open, setOpen] = useState(false);

  const onClick = props.editGramInfo ? () => setOpen(true) : undefined;
  const update = props.editGramInfo
    ? (info: GrammaticalInfo) => props.editGramInfo!(props.guid, info)
    : undefined;

  return (
    <>
      <PartOfSpeechButton
        buttonId={`sense-${props.guid}-part-of-speech`}
        gramInfo={props.gramInfo}
        onClick={onClick}
      />
      {update && (
        <EditPartOfSpeechDialog
          open={open}
          gramInfo={props.gramInfo}
          textFieldId="part-of-speech-edit"
          titleId="grammaticalCategory.partOfSpeech.editTitle"
          close={() => setOpen(false)}
          update={update}
        />
      )}
    </>
  );
}
