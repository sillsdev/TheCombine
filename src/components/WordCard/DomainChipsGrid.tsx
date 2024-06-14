import { Grid } from "@mui/material";
import { type ReactElement } from "react";

import { type SemanticDomain } from "api/models";
import DomainChip from "components/WordCard/DomainChip";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

interface DomainChipsGridProps {
  semDoms: SemanticDomain[];
  provenance?: boolean;
}

export default function DomainChipsGrid(
  props: DomainChipsGridProps
): ReactElement {
  const semDomNames = useAppSelector(
    (state: StoreState) => state.currentProjectState.semanticDomains
  );

  /** Change the domain name into the project's sem dom language;
   * if not available, fall back to the given domain's name.  */
  const updateName = (dom: SemanticDomain): SemanticDomain => {
    const name = semDomNames ? semDomNames[dom.id] ?? dom.name : dom.name;
    return { ...dom, name };
  };

  return (
    <Grid container spacing={2}>
      {props.semDoms.map((d) => (
        <Grid item key={`${d.id}${d.name}`}>
          <DomainChip domain={updateName(d)} provenance={props.provenance} />
        </Grid>
      ))}
    </Grid>
  );
}
