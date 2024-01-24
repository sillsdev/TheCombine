import { Chip, Grid } from "@mui/material";
import { ReactElement } from "react";

import { SemanticDomain, Sense } from "api/models";
import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

/** Collect all distinct sense.semanticDomains entries. */
function gatherDomains(senses: Sense[]): SemanticDomain[] {
  return senses
    .flatMap((s) => s.semanticDomains)
    .reduce<SemanticDomain[]>((a, dom) => {
      const { id, name } = dom;
      return !id || a.some((d) => d.id === id && d.name === name)
        ? a
        : [...a, dom];
    }, []);
}

export default function DomainsCell(props: CellProps): ReactElement {
  return (
    <Grid container direction="row" spacing={1}>
      {gatherDomains(props.rowData.senses).map((dom) => (
        <Grid item key={`${dom.id}-${dom.name}`}>
          <Chip label={`${dom.id}: ${dom.name}`} />
        </Grid>
      ))}
    </Grid>
  );
}
