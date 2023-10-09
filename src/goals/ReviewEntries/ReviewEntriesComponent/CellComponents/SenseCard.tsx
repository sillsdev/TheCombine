import { Card, CardContent, Chip, Grid } from "@mui/material";
import { ReactElement } from "react";

import { GramCatGroup, Sense } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import SenseCardText from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCardText";

interface SenseCardProps {
  sense: Sense;
  languages?: string[];
}

export default function SenseCard(props: SenseCardProps): ReactElement {
  const doms = props.sense.semanticDomains.map((d) => `${d.id}: ${d.name}`);
  const gramInfo = props.sense.grammaticalInfo;

  return (
    <Card>
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
        <SenseCardText sense={props.sense} languages={props.languages} />
        {/* List semantic domains. */}
        <Grid container spacing={2}>
          {doms.map((dom) => (
            <Grid item key={dom}>
              <Chip label={dom} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
