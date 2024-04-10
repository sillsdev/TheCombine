import { Card, CardContent } from "@mui/material";
import { type ReactElement } from "react";

import { GramCatGroup, type Sense } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import DomainChipsGrid from "components/WordCard/DomainChipsGrid";
import SenseCardText from "components/WordCard/SenseCardText";

interface SenseCardProps {
  bgColor?: string;
  languages?: string[];
  minimal?: boolean;
  provenance?: boolean;
  sense: Sense;
}

export default function SenseCard(props: SenseCardProps): ReactElement {
  const gramInfo = props.sense.grammaticalInfo;
  const semDoms = props.sense.semanticDomains;

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
          {gramInfo.catGroup !== GramCatGroup.Unspecified && (
            <PartOfSpeechButton
              buttonId={`sense-${props.sense.guid}-part-of-speech`}
              gramInfo={gramInfo}
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
        <DomainChipsGrid provenance={props.provenance} semDoms={semDoms} />
      </CardContent>
    </Card>
  );
}
