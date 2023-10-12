import { Card, CardContent, Grid } from "@mui/material";
import { ReactElement } from "react";

import { GramCatGroup, Sense } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import DomainChip from "components/WordCard/DomainChip";
import SenseCardText from "components/WordCard/SenseCardText";

interface SenseCardProps {
  languages?: string[];
  minimal?: boolean;
  provenance?: boolean;
  sense: Sense;
}

export default function SenseCard(props: SenseCardProps): ReactElement {
  const gramInfo = props.sense.grammaticalInfo;

  return (
    <Card style={{ backgroundColor: "white" }}>
      <CardContent style={{ position: "relative", paddingRight: 40 }}>
        {/* Icon for part of speech (if any). */}
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          {gramInfo.catGroup !== GramCatGroup.Unspecified && (
            <PartOfSpeechButton
              buttonId={`sense-${props.sense.guid}-part-of-speech`}
              gramInfo={gramInfo}
              onlyIcon
            />
          )}
        </div>
        {/* List glosses and (if any) definitions. */}
        <SenseCardText
          languages={props.languages}
          minimal={props.minimal}
          sense={props.sense}
        />
        {/* List semantic domains. */}
        <Grid container spacing={2}>
          {props.sense.semanticDomains.map((d) => (
            <Grid item key={d.guid}>
              <DomainChip
                domain={d}
                minimal={props.minimal}
                provenance={props.provenance}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
