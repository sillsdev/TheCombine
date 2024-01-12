import { Chip, Grid, Typography } from "@mui/material";
import { ReactElement } from "react";

import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

export default function DomainsCell(props: CellProps): ReactElement {
  const items: ReactElement[] = [];

  props.rowData.senses.forEach((sense) => {
    if (!sense.semanticDomains.length) {
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
      ...sense.semanticDomains.map((d) => (
        <Grid item key={`${sense.guid}-${d.id}-${d.name}`}>
          <Chip label={`${d.id}: ${d.name}`} />
        </Grid>
      ))
    );
  });

  return (
    <Grid container direction="row" spacing={1}>
      {items}
    </Grid>
  );
}
