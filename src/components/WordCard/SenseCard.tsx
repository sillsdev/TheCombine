import { Card, CardContent } from "@mui/material";
import { type ReactElement } from "react";

import { GramCatGroup, type Sense } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import DomainChipsGrid from "components/WordCard/DomainChipsGrid";
import SenseCardText from "components/WordCard/SenseCardText";

export function partOfSpeechButtonId(senseGuid: string): string {
  return `sense-${senseGuid}-part-of-speech`;
}

/** Text for the aria-label of SenseCard elements */
export enum SenseCardLabel {
  ButtonGramInfo = "Part of speech",
}

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
        <div style={{ insetInlineStart: 0, position: "absolute", top: 0 }}>
          {gramInfo.catGroup !== GramCatGroup.Unspecified && (
            <PartOfSpeechButton
              buttonId={partOfSpeechButtonId(props.sense.guid)}
              buttonLabel={SenseCardLabel.ButtonGramInfo}
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
