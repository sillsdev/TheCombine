import { Chip, Grid } from "@mui/material";
import { type ReactElement } from "react";

import { type SemanticDomain, type Sense } from "api/models";
import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

/** Collect all distinct sense.semanticDomains entries. */
export function gatherDomains(senses: Sense[]): SemanticDomain[] {
  return senses
    .flatMap((s) => s.semanticDomains)
    .reduce<SemanticDomain[]>((a, dom) => {
      const { id, name } = dom;
      return !id || a.some((d) => d.id === id && d.name === name)
        ? a
        : [...a, dom];
    }, [])
    .sort((a, b) => a.id.localeCompare(b.id));
}

export default function DomainsCell(props: CellProps): ReactElement {
  return (
    <Grid container direction="row" spacing={1}>
      {gatherDomains(props.word.senses).map((dom) => (
        <Grid item key={`${dom.id}-${dom.name}`}>
          <Chip label={`${dom.id}: ${dom.name}`} style={{ color: "inherit" }} />
        </Grid>
      ))}
    </Grid>
  );
}
