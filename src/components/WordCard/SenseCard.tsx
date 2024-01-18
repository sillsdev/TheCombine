import { Card, CardContent, Grid } from "@mui/material";
import { ReactElement } from "react";

import { GramCatGroup, Sense } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import DomainChip from "components/WordCard/DomainChip";
import SenseCardText from "components/WordCard/SenseCardText";

interface SenseCardProps {
  bgColor?: string;
  languages?: string[];
  minimal?: boolean;
  provenance?: boolean;
  sense: Sense;
}

export default function SenseCard(props: SenseCardProps): ReactElement {
  const { grammaticalInfo, semanticDomains } = props.sense;

  return (
    <Card
      style={{
        backgroundColor: props.bgColor || "white",
        marginBottom: 10,
      }}
    >
      <CardContent style={{ position: "relative" }}>
        {/* Part of speech (if any) */}
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          {grammaticalInfo.catGroup !== GramCatGroup.Unspecified && (
            <PartOfSpeechButton
              buttonId={`sense-${props.sense.guid}-part-of-speech`}
              gramInfo={grammaticalInfo}
              onlyIcon
            />
          )}
        </div>

        {/* Glosses and (if any) definitions */}
        <SenseCardText
          hideDefs={props.minimal}
          languages={props.languages}
          sense={props.sense}
        />

        {/* Semantic domains */}
        <Grid container spacing={1}>
          {semanticDomains.map((d) => (
            <Grid item key={`${d.id}_${d.name}`}>
              <DomainChip domain={d} provenance={props.provenance} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
