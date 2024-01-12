import { Grid, Typography } from "@mui/material";
import { ReactElement } from "react";

import { GramCatGroup } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

export default function PartOfSpeechCell(props: CellProps): ReactElement {
  const items: ReactElement[] = [];

  props.rowData.senses.forEach((sense) => {
    if (sense.grammaticalInfo.catGroup === GramCatGroup.Unspecified) {
      return;
    }

    if (items.length) {
      items.push(
        <Grid item key={`${sense.guid}-sep`}>
          <Typography>{"|"}</Typography>
        </Grid>
      );
    }

    items.push(
      <Grid item key={`${sense.guid}-part-of-speech`}>
        <PartOfSpeechButton
          buttonId={`${sense.guid}-part-of-speech`}
          gramInfo={sense.grammaticalInfo}
        />{" "}
      </Grid>
    );
  });

  return (
    <Grid container direction="row" spacing={2}>
      {items}
    </Grid>
  );
}
